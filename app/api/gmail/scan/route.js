import { adminClient } from "../../../../lib/admin.mjs";
import { SEARCH, refreshAccessToken, gmailGet, bodyText, header } from "../../../../lib/gmail.mjs";
import { callGemini, callClaude, extractEmail } from "../../../../lib/extract.mjs";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_EMAILS = 40;
const BUDGET_MS = 40000;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Reads the signed-in person's last 14 days of Gmail (read-only), finds actions, and saves them as proposed.
export async function POST(request) {
  const token = /^Bearer (.+)$/.exec(request.headers.get("authorization") ?? "")?.[1];
  if (!token) return Response.json({ error: "Please sign in." }, { status: 401 });

  const admin = adminClient();
  const { data: auth } = await admin.auth.getUser(token);
  const user = auth?.user;
  if (!user) return Response.json({ error: "Please sign in again." }, { status: 401 });

  const { data: saved } = await admin.from("gmail_tokens").select("*").eq("user_id", user.id).maybeSingle();
  if (!saved) return Response.json({ error: "not_connected" }, { status: 400 });

  let accessToken;
  try {
    ({ access_token: accessToken } = await refreshAccessToken({
      refreshToken: saved.refresh_token,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }));
  } catch {
    return Response.json({ error: "not_connected" }, { status: 400 });
  }

  const started = Date.now();
  const provider = process.env.ANTHROPIC_API_KEY ? "claude" : "gemini";
  const call = async (system, userText) => {
    const run = () =>
      provider === "claude"
        ? callClaude(system, userText, { apiKey: process.env.ANTHROPIC_API_KEY, model: process.env.CLAUDE_MODEL || "claude-haiku-5-5" })
        : callGemini(system, userText, { apiKey: process.env.GEMINI_API_KEY, model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite" });
    try {
      return await run();
    } catch (err) {
      if (err.status !== 429) throw err;
      await wait(5000);
      return run();
    }
  };

  try {
    const list = await gmailGet(`messages?q=${encodeURIComponent(SEARCH)}&maxResults=${MAX_EMAILS}`, accessToken);
    const ids = (list.messages ?? []).map((m) => m.id);
    const { data: seen } = await admin.from("scanned_messages").select("message_id").eq("user_id", user.id).in("message_id", ids.length ? ids : ["-"]);
    const done = new Set((seen ?? []).map((r) => r.message_id));
    const todo = ids.filter((id) => !done.has(id));

    const found = [];
    let read = 0;
    let failed = 0;
    let next = 0;
    const own = saved.email.toLowerCase();
    const worker = async () => {
      while (next < todo.length) {
        const id = todo[next++];
        if (Date.now() - started > BUDGET_MS) return;
        try {
          const msg = await gmailGet(`messages/${id}?format=full`, accessToken);
          const from = header(msg.payload, "From");
          const receivedAt = new Date(Number(msg.internalDate)).toISOString();
          const email = { subject: header(msg.payload, "Subject"), from, receivedAt, body: bodyText(msg.payload) };
          if (!from.toLowerCase().includes(own) && email.body) {
            const result = await extractEmail(email, { call });
            const rows = result.proposals.map((p) => ({
              user_id: user.id,
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
              const { error } = await admin.from("items").insert(row);
              if (error && error.code !== "23505") throw error;
              if (!error) found.push(row);
            }
          }
          await admin.from("scanned_messages").upsert({ user_id: user.id, message_id: id });
          read += 1;
        } catch (err) {
          console.error("scan email failed", id, err?.message);
          failed += 1;
        }
      }
    };
    await Promise.all([worker(), worker(), worker()]);

    await admin.from("scan_state").upsert({ user_id: user.id, last_scan_at: new Date().toISOString() });

    return Response.json({ ok: true, email: saved.email, found: found.length, read, failed, total: ids.length, left: Math.max(0, todo.length - read - failed) });
  } catch (err) {
    console.error("scan failed", err?.message, err?.code);
    if (err.status === 401 || err.status === 403) return Response.json({ error: "not_connected" }, { status: 400 });
    return Response.json({ error: "The scan did not finish. Try again in a minute." }, { status: 500 });
  }
}
