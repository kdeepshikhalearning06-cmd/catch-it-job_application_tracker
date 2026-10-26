import test from "node:test";
import assert from "node:assert/strict";
import { checkProposals, scoreEmail, extractEmail, toIst, pickModel, callOpenRouter, isJobAd, isJobAlertSender, isCourseSender, isCourseEvent, sameTask, SYSTEM_PROMPT } from "../lib/extract.mjs";
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

test("evidence made of two separate sentences from the email passes", () => {
  const email = { body: "Your exam is on Friday, 23 October 2026.\n\nRead the guide.\n• Entry begins at 7:30 AM." };
  const text = JSON.stringify({ proposals: [{ action: "Attend the exam", deadline: "2026-10-23T07:30:00+05:30", link: null, evidence: "Your exam is on Friday, 23 October 2026. Entry begins at 7:30 AM.", confidence: "high" }] });
  const { proposals, problems } = checkProposals(email, text);
  assert.equal(problems.length, 0);
  assert.equal(proposals.length, 1);
});

test("received time is sent to the model in IST", () => {
  assert.equal(toIst("2026-10-21T10:00:00+00:00"), "2026-10-21T15:30:00+05:30");
});

test("pickModel uses OpenRouter when only its key is set, and Claude first when both are", () => {
  assert.equal(pickModel({ OPENROUTER_API_KEY: "x", GEMINI_API_KEY: "g" }).model, "google/gemini-3.5-flash-lite");
  assert.equal(pickModel({ OPENROUTER_API_KEY: "x", ANTHROPIC_API_KEY: "a" }).model, "claude-haiku-5-5");
  assert.equal(pickModel({ GEMINI_API_KEY: "g" }).model, "gemini-3.5-flash-lite");
  assert.equal(pickModel({ GROQ_API_KEY: "q", GEMINI_API_KEY: "g" }).model, "openai/gpt-oss-120b");
});

test("drops a no-date 'apply' card from a job ad", () => {
  const ad = { from: "Glassdoor Jobs <noreply@glassdoor.com>", body: "If you're eager to learn, feel free to apply now or review the job description to learn more." };
  const text = JSON.stringify({ proposals: [{ company: "Messold", action: "Apply for the Intern - Operations role", deadline: null, evidence: "If you're eager to learn, feel free to apply now or review the job description to learn more.", confidence: "high" }] });
  const { proposals, problems } = checkProposals(ad, text);
  assert.equal(proposals.length, 0);
  assert.equal(problems.length, 0);
});

test("keeps a real ask that is not a new application", () => {
  const email = { body: "Please complete your profile (education and work experience) on our careers portal to move forward." };
  const text = JSON.stringify({ proposals: [{ action: "Complete your candidate profile", deadline: null, evidence: "Please complete your profile (education and work experience) on our careers portal to move forward.", confidence: "high" }] });
  assert.equal(checkProposals(email, text).proposals.length, 1);
  assert.equal(isJobAd({ action: "Submit your application form", deadline: null }), false);
  assert.equal(isJobAd({ action: "Submit a quick application", deadline: null }), true);
});

test("spots job-board alert senders but not recruiters", () => {
  for (const f of ["Glassdoor Jobs <noreply@glassdoor.com>", "Indeed <donotreply@match.indeed.com>", "LinkedIn <jobalerts-noreply@linkedin.com>", "jobalerts@naukri-sample.com"]) assert.ok(isJobAlertSender(f), f);
  for (const f of ["Kanha Mishra <kanha@gmail.com>", "Techverse <no-reply@hire.techverse-test.in>", "Employer via Indeed <abc@indeedemail.com>", "careers@samplemotors.in", "Recruiter via Naukri <info@naukri.com>"]) assert.ok(!isJobAlertSender(f), f);
});

test("drops course live sessions and webinars, keeps interviews on Meet", () => {
  const body = "Join the AI live session on 26 October at 7:00 PM IST on Google Meet: https://meet.google.com/abc. Your interview is scheduled for 29 October at 3:00 PM IST on Google Meet.";
  const text = JSON.stringify({ proposals: [
    { action: "Join the AI live session", deadline: "2026-10-26T19:00:00+05:30", evidence: "Join the AI live session on 26 October at 7:00 PM IST on Google Meet: https://meet.google.com/abc.", confidence: "high" },
    { action: "Attend the interview", deadline: "2026-10-29T15:00:00+05:30", evidence: "Your interview is scheduled for 29 October at 3:00 PM IST on Google Meet.", confidence: "high" },
  ] });
  const out = checkProposals({ body }, text).proposals;
  assert.deepEqual(out.map((p) => p.action), ["Attend the interview"]);
  assert.ok(isCourseEvent({ action: "Register for the free webinar" }));
});

test("spots course senders unless the subject is about hiring", () => {
  assert.ok(isCourseSender("Outskill <hello@outskill.com>", "Your AI live session starts at 7 PM"));
  assert.ok(isCourseSender("GrowthSchool <team@mail.growthschool.io>", "Masterclass tonight"));
  assert.ok(!isCourseSender("Outskill Careers <careers@outskill.com>", "Interview scheduled: Community Manager"));
  for (const f of ["hr@greenleaf-test.in", "noreply@unstop-sample.com", "Internshala <student@internshala.com>"]) assert.ok(!isCourseSender(f, "Round 1"), f);
});

test("a reminder or forwarded copy is the same task", () => {
  const first = { company: "Techverse Labs", link: "https://hr.techverse-test.in/pa", deadline: "2026-10-23T23:59:00+05:30" };
  assert.ok(sameTask(first, { company: "Techverse", link: "https://hr.techverse-test.in/pa", deadline: "2026-10-23T18:00:00+05:30" }));
  assert.ok(sameTask(first, { company: "techverse labs", link: null, deadline: "2026-10-23T18:29:00Z" }));
  assert.ok(!sameTask(first, { company: "Techverse Labs", link: null, deadline: "2026-10-28T17:00:00+05:30" }));
  assert.ok(!sameTask({ company: null, link: null, deadline: null }, { company: null, link: null, deadline: null }));
});

test("the same ask sent again by one company is one task", () => {
  const co = "Zoxima Solutions Pvt Ltd";
  const resend = { company: co, action: "Resend the signed offer letter and all documents", deadline: null };
  assert.ok(sameTask(resend, { company: co, action: "Resend the signed offer letter and documents", deadline: null }));
  assert.ok(sameTask(resend, { company: co, action: "Send the signed offer letter and required documents", deadline: "2026-10-16T18:29:59Z" }));
  assert.ok(sameTask({ company: co, action: "Fill in the relevant details in the attached Excel sheet", deadline: null }, { company: co, action: "Fill in the relevant details in the attached Excel sheet", deadline: null }));
  // Different asks, other companies, or dates that disagree stay separate.
  assert.ok(!sameTask(resend, { company: co, action: "Fill in the relevant details in the attached Excel sheet", deadline: null }));
  assert.ok(!sameTask({ company: "Greenleaf", action: "Complete the online assessment", deadline: null }, { company: "Greenleaf", action: "Attend the interview", deadline: null }));
  assert.ok(!sameTask({ company: "Greenleaf", action: "Submit the assignment", deadline: "2026-10-28T12:00:00Z" }, { company: "Greenleaf", action: "Submit the assignment", deadline: "2026-11-04T12:00:00Z" }));
  assert.ok(!sameTask({ company: "Greenleaf", action: "Submit the assignment", deadline: null }, { company: "Quantum", action: "Submit the assignment", deadline: null }));
});

test("prompt covers scams, time zones, windows, forwards and recruiter messages", () => {
  for (const words of ["Aadhaar", "Telegram", "converted to IST", "window's close", "Forwarded message", "recruiter's message", "internship cell"]) assert.ok(SYSTEM_PROMPT.includes(words), words);
});

test("Groq calls go to Groq's address, OpenRouter stays the default", async () => {
  const urls = [];
  const fetchImpl = async (url) => { urls.push(url); return { ok: true, json: async () => ({ choices: [{ message: { content: "{}" } }] }) }; };
  await callOpenRouter("s", "u", { apiKey: "k", fetchImpl, baseUrl: "https://api.groq.com/openai/v1" });
  await callOpenRouter("s", "u", { apiKey: "k", fetchImpl });
  assert.deepEqual(urls, ["https://api.groq.com/openai/v1/chat/completions", "https://openrouter.ai/api/v1/chat/completions"]);
});

test("Groq moves to the next model when one runs out for the day", async () => {
  const seen = [];
  const fetchImpl = async (url, init) => {
    const { model } = JSON.parse(init.body);
    seen.push(model);
    if (model === "openai/gpt-oss-120b") return { ok: false, status: 429, headers: { get: () => null }, text: async () => "Rate limit reached on tokens per day (TPD): Limit 200000" };
    return { ok: true, json: async () => ({ choices: [{ message: { content: "{}" } }] }) };
  };
  const realFetch = globalThis.fetch;
  globalThis.fetch = fetchImpl;
  try {
    const picked = pickModel({ GROQ_API_KEY: "q" });
    assert.equal(await picked.call("s", "u"), "{}");
    assert.deepEqual(seen, ["openai/gpt-oss-120b", "qwen/qwen3.8-27b"]);
    assert.equal(picked.model, "qwen/qwen3.8-27b");
  } finally {
    globalThis.fetch = realFetch;
  }
});
