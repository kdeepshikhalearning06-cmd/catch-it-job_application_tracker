import { callGemini, extractEmail, scoreEmail } from "../../../lib/extract.mjs";
import { buildSamples } from "../../../lib/samples.mjs";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Runs the sample emails through the model and scores them. Sample emails only, never user input.
// /api/extract-demo?id=3 runs one email; without id it runs all ten.
export async function GET(request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return Response.json({ ok: false, error: "GEMINI_API_KEY is not set" }, { status: 500 });
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

  const now = new Date();
  const id = new URL(request.url).searchParams.get("id");
  const samples = buildSamples(now).filter((s) => !id || String(s.id) === id);

  const call = async (system, user) => {
    try {
      return await callGemini(system, user, { apiKey, model });
    } catch (err) {
      if (err.status !== 429) throw err;
      await wait(5000);
      return callGemini(system, user, { apiKey, model });
    }
  };

  // Three at a time, and stop starting new emails after 40 seconds so the page always answers.
  const started = Date.now();
  const results = new Array(samples.length);
  let next = 0;
  const worker = async () => {
    while (next < samples.length) {
      const i = next++;
      const email = samples[i];
      if (Date.now() - started > 40000) {
        results[i] = { id: email.id, note: email.note, error: "Skipped: ran out of time, try ?id=" + email.id };
        continue;
      }
      try {
        const result = await extractEmail(email, { call, now });
        results[i] = {
          id: email.id,
          note: email.note,
          expected: email.expected.deadlines,
          got: result.proposals,
          problems: result.problems,
          score: scoreEmail(email.expected, result),
        };
      } catch (err) {
        const reason = err.name === "TimeoutError" ? "Gemini took longer than 20 seconds" : String(err.message).slice(0, 300);
        results[i] = { id: email.id, note: email.note, error: reason };
      }
    }
  };
  await Promise.all([worker(), worker(), worker()]);

  const scored = results.filter((r) => r.score);
  const summary = {
    emails: results.length,
    errors: results.filter((r) => r.error).length,
    actionRight: scored.filter((r) => r.score.actionOk).length,
    deadlineRight: scored.filter((r) => r.score.deadlinesOk).length,
    inventedDeadlines: scored.filter((r) => r.score.invented).length,
  };
  return Response.json({ ok: true, model, summary, results });
}
