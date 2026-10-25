import test from "node:test";
import assert from "node:assert/strict";
import { bodyText, header, buildAuthUrl, emailFromIdToken, SEARCH, subjectLooksJobRelated, isFinanceEmail } from "../lib/gmail.mjs";

const enc = (s) => Buffer.from(s).toString("base64url");

test("bodyText prefers text/plain in nested parts", () => {
  const payload = {
    mimeType: "multipart/alternative",
    parts: [
      { mimeType: "text/plain", body: { data: enc("Deadline: 30th March | 10:00 AM") } },
      { mimeType: "text/html", body: { data: enc("<p>ignored</p>") } },
    ],
  };
  assert.equal(bodyText(payload), "Deadline: 30th March | 10:00 AM");
});

test("bodyText falls back to html and keeps link addresses", () => {
  const payload = {
    mimeType: "text/html",
    body: { data: enc('<style>p{}</style><p>Take the test</p><a href="https://t.example/x">Start Now</a>') },
  };
  const text = bodyText(payload);
  assert.match(text, /Take the test/);
  assert.match(text, /Start Now \(https:\/\/t\.example\/x\)/);
  assert.doesNotMatch(text, /p\{\}/);
});

test("header is case-insensitive", () => {
  assert.equal(header({ headers: [{ name: "Subject", value: "Hi" }] }, "subject"), "Hi");
  assert.equal(header({ headers: [] }, "from"), "");
});

test("auth url asks only for read-only Gmail and offline access", () => {
  const url = new URL(buildAuthUrl({ clientId: "id", redirectUri: "https://x/cb", state: "s" }));
  assert.match(url.searchParams.get("scope"), /gmail\.readonly/);
  assert.doesNotMatch(url.searchParams.get("scope"), /gmail\.(send|modify|compose)/);
  assert.equal(url.searchParams.get("access_type"), "offline");
});

test("emailFromIdToken needs a verified email", () => {
  const token = (p) => `h.${enc(JSON.stringify(p))}.s`;
  assert.equal(emailFromIdToken(token({ email: "A@B.com", email_verified: true })), "a@b.com");
  assert.equal(emailFromIdToken(token({ email: "a@b.com", email_verified: false })), null);
});

test("search matches recruiter words in the subject only", () => {
  assert.match(SEARCH, /subject:\(interview OR /);
  for (const s of ["Offer letter - Growth Intern", "Next steps: documents and HR call", "Round 1 is live soon: Brandstorm Case Challenge", "Josh Talks| Product Management Intern | Task", "Vertex Consulting - Campus Hiring 2026 - Important instructions"]) assert.ok(subjectLooksJobRelated(s), s);
  for (const s of ["Your credit card statement for October is ready", "Career Digest: 5 resume tips"]) assert.ok(!subjectLooksJobRelated(s), s);
});

test("finance emails are skipped before the AI, job emails are not", () => {
  for (const e of [{ subject: "Payment due reminder: ICICI Credit Card" }, { subject: "Reminder: EMI due on 5 Nov" }, { subject: "Invoice #4411 due" }, { subject: "Reminder: complete your KYC" }, { subject: "Reminder", from: "HDFC <estatements@hdfcbank.net>" }]) assert.ok(isFinanceEmail(e), e.subject);
  for (const e of [{ subject: "Action needed: complete your candidate profile", from: "no-reply@careers.harborbank-test.com" }, { subject: "Internship confirmed - pay registration fee" }, { subject: "Offer letter: share your bank account details for onboarding" }, { subject: "Interview with Deepshikha Kumari", from: "Sahil <Sahil.Sahil5@aexp.com>" }]) assert.ok(!isFinanceEmail(e), e.subject);
});
