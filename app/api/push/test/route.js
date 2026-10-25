import { adminClient } from "../../../../lib/admin.mjs";
import { sendPush, userFromRequest } from "../../../../lib/push.mjs";
import { reminderMessage } from "../../../../lib/remind.mjs";

export const dynamic = "force-dynamic";

// Sends one reminder right now to this device only, using the person's next confirmed item.
export async function POST(request) {
  const admin = adminClient();
  const user = await userFromRequest(admin, request);
  if (!user) return Response.json({ error: "Please sign in again." }, { status: 401 });

  const { endpoint } = await request.json().catch(() => ({}));
  const { data: subs } = await admin.from("push_subscriptions").select("*").eq("user_id", user.id).eq("endpoint", endpoint ?? "");
  if (!subs?.length) return Response.json({ error: "Turn on reminders on this device first." }, { status: 400 });

  const now = new Date();
  const { data: next } = await admin
    .from("items")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "confirmed")
    .gt("deadline", now.toISOString())
    .order("deadline", { ascending: true })
    .limit(1);
  const message = next?.[0]
    ? { ...reminderMessage(next[0], "hours", now), tag: "test" }
    : { title: "Catchit reminders are on", body: "You'll get a nudge a day before and 2 hours before each deadline.", url: "/today", tag: "test" };

  try {
    const sent = await sendPush(admin, subs, message);
    if (!sent) return Response.json({ error: "This device stopped accepting reminders. Turn them on again." }, { status: 410 });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("test push failed", err?.message);
    return Response.json({ error: "Reminders are not set up on the server yet." }, { status: 503 });
  }
}
