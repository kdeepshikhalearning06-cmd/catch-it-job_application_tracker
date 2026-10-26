import { adminClient } from "../../../../lib/admin.mjs";
import { scanUser, NotConnected } from "../../../../lib/scanUser.mjs";
import { sendPush, pushReady } from "../../../../lib/push.mjs";
import { dueReminders, reminderMessage, foundMessage, DAY_BEFORE } from "../../../../lib/remind.mjs";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BUDGET_MS = 45000;

// Background job, every 15 minutes (Supabase schedule) plus once a day (Vercel cron).
// 1. Reads new Gmail for everyone connected and tells them what was found.
// 2. Sends the day-before and 2-hours-before reminders for confirmed items.
export async function GET(request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Not allowed." }, { status: 401 });
  }
  if (!pushReady()) return Response.json({ error: "Push keys are not set." }, { status: 503 });

  const started = Date.now();
  const admin = adminClient();
  const now = new Date();
  const report = { scanned: 0, found: 0, reminders: 0, pushed: 0, errors: 0 };

  const { data: subs } = await admin.from("push_subscriptions").select("*");
  const devices = new Map();
  for (const s of subs ?? []) devices.set(s.user_id, [...(devices.get(s.user_id) ?? []), s]);

  // 1. Background Gmail scan. Only new emails are read, so most runs cost one Gmail call per person.
  // Shuffled, so a slow inbox at the top of the list can't use up every run's time and leave the rest unread.
  const { data: accounts } = await admin.from("gmail_tokens").select("*");
  const order = [...(accounts ?? [])].sort(() => Math.random() - 0.5);
  for (const saved of order) {
    const left = BUDGET_MS - (Date.now() - started) - 15000;
    if (left < 5000) break;
    try {
      const r = await scanUser(admin, saved, { budgetMs: Math.min(left, 20000) });
      report.scanned += 1;
      report.found += r.found.length;
      const mine = devices.get(saved.user_id);
      if (r.found.length && mine) report.pushed += await sendPush(admin, mine, foundMessage(r.found));
    } catch (err) {
      if (!(err instanceof NotConnected)) console.error("background scan failed", err?.message);
      report.errors += 1;
    }
  }

  // 2. Reminders for people with at least one device. Demo items are skipped; the demo uses the test button.
  const users = [...devices.keys()];
  if (users.length) {
    const { data: items } = await admin
      .from("items")
      .select("*")
      .in("user_id", users)
      .eq("status", "confirmed")
      .neq("source", "demo")
      .gt("deadline", now.toISOString())
      .lte("deadline", new Date(now.getTime() + DAY_BEFORE).toISOString());
    const ids = (items ?? []).map((i) => i.id);
    const { data: done } = await admin.from("sent_reminders").select("item_id, kind").in("item_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
    const sent = new Set((done ?? []).map((r) => `${r.item_id}:${r.kind}`));
    for (const { item, kind } of dueReminders(items ?? [], now, sent)) {
      // Claim the reminder first, so two overlapping runs never send it twice.
      const { error } = await admin.from("sent_reminders").insert({ item_id: item.id, kind });
      if (error) continue;
      report.reminders += 1;
      report.pushed += await sendPush(admin, devices.get(item.user_id), reminderMessage(item, kind, now));
    }
  }

  return Response.json({ ok: true, ...report, ms: Date.now() - started });
}
