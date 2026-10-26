// Reads one person's recent Gmail (read-only), finds actions, and saves them as proposed.
// Used by the "Scan my Gmail" button and by the background job. Server only.

import { buildSearch, refreshAccessToken, gmailGet, bodyText, header, isFinanceEmail, isForwarded } from "./gmail.mjs";
import { pickModel, extractEmail, isJobAlertSender, isCourseSender, isRepeat } from "./extract.mjs";

const MAX_EMAILS = 40;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export class NotConnected extends Error {}

const modelCall = () => pickModel().call;

// saved: the person's gmail_tokens row. Returns totals and the rows it added.
export async function scanUser(admin, saved, { force = false, budgetMs = 40000 } = {}) {
  const started = Date.now();
  const userId = saved.user_id;

  let accessToken;
  try {
    ({ access_token: accessToken } = await refreshAccessToken({
      refreshToken: saved.refresh_token,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }));
  } catch {
    throw new NotConnected();
  }

  const call = modelCall();
  let list;
  try {
    list = await gmailGet(`messages?q=${encodeURIComponent(buildSearch(force ? 30 : 14))}&maxResults=${MAX_EMAILS}`, accessToken);
  } catch (err) {
    if (err.status === 401 || err.status === 403) throw new NotConnected();
    throw err;
  }
  const ids = (list.messages ?? []).map((m) => m.id);
  const { data: seen } = await admin.from("scanned_messages").select("message_id").eq("user_id", userId).in("message_id", ids.length ? ids : ["-"]);
  const done = new Set((seen ?? []).map((r) => r.message_id));
  // Right after connecting, read everything again (items are de-duplicated by the database).
  const todo = force ? ids : ids.filter((id) => !done.has(id));

  const { data: current } = await admin.from("items").select("gmail_message_id, company, link, deadline, action, status").eq("user_id", userId).order("created_at", { ascending: false }).limit(300);
  const listed = current ?? [];

  const found = [];
  let read = 0;
  let failed = 0;
  let next = 0;
  const own = saved.email.toLowerCase();
  const worker = async () => {
    while (next < todo.length) {
      const id = todo[next++];
      if (Date.now() - started > budgetMs) return;
      try {
        const msg = await gmailGet(`messages/${id}?format=full`, accessToken);
        const from = header(msg.payload, "From");
        const receivedAt = new Date(Number(msg.internalDate)).toISOString();
        const email = { subject: header(msg.payload, "Subject"), from, receivedAt, body: bodyText(msg.payload) };
        const fromSelf = from.toLowerCase().includes(own);
        if ((!fromSelf || isForwarded(email.subject)) && !isJobAlertSender(from) && !isCourseSender(from, email.subject) && !isFinanceEmail(email) && email.body) {
          const result = await extractEmail(email, { call });
          const rows = result.proposals.map((p) => ({
            user_id: userId,
            source: "gmail",
            gmail_message_id: id,
            company: p.company,
            role: p.role,
            action: p.action,
            deadline: p.deadline,
            link: p.link,
            evidence: p.evidence,
            confidence: p.confidence,
            status: "proposed",
            received_at: receivedAt,
          }));
          for (const row of rows) {
            // A reminder, a forwarded copy, or a second read of the same email adds nothing new.
            if (isRepeat(listed, row)) continue;
            const { error } = await admin.from("items").insert(row);
            if (error && error.code !== "23505") throw error;
            if (!error) { found.push(row); listed.push({ ...row, fresh: true }); }
          }
        }
        await admin.from("scanned_messages").upsert({ user_id: userId, message_id: id });
        read += 1;
      } catch (err) {
        console.error("scan email failed", id, err?.message);
        failed += 1;
      }
    }
  };
  await Promise.all([worker(), worker(), worker()]);

  await admin.from("scan_state").upsert({ user_id: userId, last_scan_at: new Date().toISOString() });

  return { email: saved.email, found, read, failed, total: ids.length, left: Math.max(0, todo.length - read - failed) };
}
