import test from "node:test";
import assert from "node:assert/strict";
import { bodyText, header, buildAuthUrl, emailFromIdToken } from "../lib/gmail.mjs";

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
