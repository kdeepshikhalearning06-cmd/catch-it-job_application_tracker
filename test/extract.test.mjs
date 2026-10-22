import test from "node:test";
import assert from "node:assert/strict";
import { checkProposals, scoreEmail, extractEmail } from "../lib/extract.mjs";
import { buildSamples, ist } from "../lib/samples.mjs";

const now = new Date("2026-10-22T14:00:00Z");
const samples = buildSamples(now);
const s1 = samples[0];

test("accepts a correct proposal", () => {
  const evidence = s1.body.split("\n").find((l) => l.includes("assessment"));
  const text = JSON.stringify({ proposals: [{ company: "Sample Tech", role: "Analyst", action: "Complete the online assessment", deadline: s1.expected.deadlines[0], link: "https://assessments.example.com/t/abc123", evidence, confidence: "high" }] });
  const { proposals, problems } = checkProposals(s1, text);
  assert.equal(problems.length, 0);
  assert.equal(proposals.length, 1);
});

test("rejects evidence that is not in the email", () => {
  const text = JSON.stringify({ proposals: [{ action: "Do a thing", deadline: null, evidence: "A sentence the email never said", confidence: "high" }] });
  const { proposals, problems } = checkProposals(s1, text);
  assert.equal(proposals.length, 0);
  assert.match(problems[0], /evidence is not in the email/);
});

test("rejects a link that is not in the email", () => {
  const text = JSON.stringify({ proposals: [{ action: "Do a thing", deadline: null, link: "https://evil.example.com", evidence: "Thank you for applying for the Analyst role at Sample Tech.", confidence: "high" }] });
  const { problems } = checkProposals(s1, text);
  assert.match(problems[0], /link is not in the email/);
});

test("rejects a deadline whose evidence has no date", () => {
  const text = JSON.stringify({ proposals: [{ action: "Do a thing", deadline: ist(now, 2, 9), evidence: "Thank you for applying for the Analyst role at Sample Tech.", confidence: "high" }] });
  const { problems } = checkProposals(s1, text);
  assert.match(problems[0], /no date in the evidence/);
});

test("rejects invalid JSON", () => {
  assert.match(checkProposals(s1, "not json").problems[0], /not valid JSON/);
});

test("scores an invented deadline", () => {
  const empty = scoreEmail({ deadlines: [null] }, { proposals: [{ deadline: ist(now, 1, 9) }], problems: [] });
  assert.equal(empty.invented, true);
  assert.equal(empty.deadlinesOk, false);
});

test("scores two deadlines in any order", () => {
  const two = samples[3];
  const r = scoreEmail(two.expected, { proposals: [{ deadline: two.expected.deadlines[1] }, { deadline: two.expected.deadlines[0] }], problems: [] });
  assert.equal(r.actionOk && r.deadlinesOk && !r.invented, true);
});

test("extractEmail passes the email through the model call", async () => {
  const email = samples[7];
  const res = await extractEmail(email, { call: async () => JSON.stringify({ proposals: [] }), now });
  assert.equal(res.proposals.length, 0);
  assert.equal(scoreEmail(email.expected, res).actionOk, true);
});

test("every sample has expected deadlines and unique ids", () => {
  assert.equal(samples.length, 10);
  assert.equal(new Set(samples.map((s) => s.id)).size, 10);
});
