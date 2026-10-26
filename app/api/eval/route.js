import { pickModel, extractEmail, scoreEmail } from "../../../lib/extract.mjs";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Runs the private cases (table eval_cases) through the model. Needs ?key=EVAL_KEY.
// Optional ?from=&to= (case ids) runs a slice, so free-tier models with small per-minute limits can finish in time.
export async function GET(request) {
  const evalKey = process.env.EVAL_KEY?.trim();
  const url = new URL(request.url);
  if (!evalKey || url.searchParams.get("key")?.trim() !== evalKey) {
    return Response.json({ ok: false, error: "Not allowed" }, { status: 401 });
  }
  const { model, call } = pickModel();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/eval_cases?select=*&order=id`,
    { headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` } },
  );
  if (!res.ok) return Response.json({ ok: false, error: "Could not read cases" }, { status: 500 });
  const from = Number(url.searchParams.get("from")) || 0;
  const to = Number(url.searchParams.get("to")) || Infinity;
  const cases = (await res.json()).filter((c) => c.id >= from && c.id <= to);

  const now = new Date();
  // Two at a time, not all at once, so the provider's rate limit isn't hit in the first second.
  const results = [];
  const queue = [...cases];
  const runCase = async (c) => {
    const email = { subject: c.subject, from: c.from_addr, receivedAt: c.received_at, body: c.body };
    try {
      const result = await extractEmail(email, { call, now });
      return {
        id: c.id,
        label: c.label,
        expected: c.expected_deadlines,
        got: result.proposals.map((p) => ({ action: p.action, deadline: p.deadline, confidence: p.confidence, link: p.link })),
        problems: result.problems,
        score: scoreEmail({ deadlines: c.expected_deadlines }, result),
      };
    } catch (err) {
      return { id: c.id, label: c.label, error: String(err.message).slice(0, 300) };
    }
  };
  const worker = async () => {
    for (let c; (c = queue.shift()); ) results.push(await runCase(c));
  };
  await Promise.all([worker(), worker()]);
  results.sort((a, b) => a.id - b.id);
  const scored = results.filter((r) => r.score);
  return Response.json({
    ok: true,
    model,
    summary: {
      cases: results.length,
      errors: results.filter((r) => r.error).length,
      actionRight: scored.filter((r) => r.score.actionOk).length,
      deadlineRight: scored.filter((r) => r.score.deadlinesOk).length,
      inventedDeadlines: scored.filter((r) => r.score.invented).length,
    },
    results,
  });
}
