// Small Gmail helpers: Google sign-in URLs, token calls, and turning a message into plain text.

export const SCOPE = "openid email https://www.googleapis.com/auth/gmail.readonly";

// Words recruiters put in subject lines. Gmail matches whole words, so both "intern" and "internship" are listed.
export const JOB_WORDS = [
  "interview", "interviews", "assessment", "assignment", "task", "deadline", "last date", "last day", "shortlisted",
  "shortlist", "next round", "round", "test", "invitation", "invite", "schedule", "scheduled", "rescheduled", "slot",
  "submit", "submission", "application", "selected", "selection", "exam", "examination", "admit card", "hall ticket",
  "reporting", "reminder", "due", "register", "registration", "offer", "intern", "internship", "hr", "next step",
  "next steps", "case study", "challenge", "quiz", "hiring", "recruitment", "placement", "candidate", "onboarding",
  "joining", "documents", "apprentice",
  // Vague recruiter follow-ups ("Following up", "Quick update on your profile").
  "follow up", "following up", "follow-up", "followup", "checking in", "update", "status", "opportunity",
  "profile", "role", "position", "job", "career", "careers", "congratulations", "candidature", "regarding",
  "recruiter",
];

// Sender words that mark a company or recruiter mailbox (hr@, careers@, "Talent Team"), so any subject is read.
export const RECRUITER_SENDERS = [
  "hr", "careers", "career", "talent", "recruit", "recruiting", "recruiter", "recruitment", "hiring", "campus",
  "placement", "placements", "tpo", "internshala", "unstop",
];

const orList = (words) => words.map((w) => (w.includes(" ") ? `"${w}"` : w)).join(" OR ");

// Hiring platforms and recruiter-message senders. Their mail often lands in the Promotions or Social tab
// (LinkedIn messages, Superset drives, test invites), so they are searched in every tab.
export const PLATFORM_SENDERS = [
  "messages-noreply@linkedin.com", "inmail-hit-reply@linkedin.com", "naukri.com", "joinsuperset.com", "unstop.com",
  "internshala.com", "hackerrank.com", "hackerearth.com", "mettl.com", "myamcat.com", "hirepro.in", "calendly.com",
];

// Read-only search, never the body: in the Primary tab, a recruiter word in the SUBJECT or a recruiter-style sender;
// in any tab, a hiring platform; and emails the person forwarded to themselves ("Fwd: TPO notice").
// The first scan after connecting looks back 30 days, later scans 14.
export function buildSearch(days = 14) {
  const primary = `(-in:sent -category:promotions -category:social (subject:(${orList(JOB_WORDS)}) OR from:(${orList(RECRUITER_SENDERS)})))`;
  const platforms = `(-in:sent from:(${PLATFORM_SENDERS.join(" OR ")}))`;
  const forwarded = "(from:me to:me subject:(fwd OR fw))";
  return `newer_than:${days}d -in:chats (${primary} OR ${platforms} OR ${forwarded})`;
}
export const SEARCH = buildSearch(14);

// A self-sent email is read only when it forwards something.
export const isForwarded = (subject = "") => /^\s*(?:fwd?|fw)\s*:/i.test(subject);

// Finance mail that a job word in the subject can still pull in ("Payment due", "Reminder: card statement").
// It is skipped before the AI sees it, unless the subject is clearly about a job.
const FINANCE_SUBJECT = /\b(?:statement|e-?statement|transaction|txn|otp|one time password|emi|credit card|debit card|bank account|net ?banking|invoice|bill|billing|payment (?:due|received|successful|failed|reminder)|amount due|upi|autopay|e-?mandate|account balance|kyc|loan|premium|mutual fund|sip|portfolio|demat|refund)\b/i;
const FINANCE_SENDER = /(?:^|[<\s])(?:e?statements?|creditcards?|cards|billing|payments?|transactions?|banking)@/i;
const CLEARLY_JOB = /\b(?:interview|assessment|assignment|internship|offer letter|shortlisted|hiring|recruitment|placement|candidate|exam|examination)\b/i;

export function isFinanceEmail({ subject = "", from = "" } = {}) {
  if (CLEARLY_JOB.test(subject)) return false;
  return FINANCE_SUBJECT.test(subject) || FINANCE_SENDER.test(from);
}

// The same subject rule as SEARCH, for tests and for checking a subject by hand.
const wordRe = (w) => new RegExp(`\\b${w.replace(/ /g, "\\s+")}\\b`, "i");
const JOB_RES = JOB_WORDS.map(wordRe);
export const subjectLooksJobRelated = (subject = "") => JOB_RES.some((re) => re.test(subject));
const SENDER_RES = RECRUITER_SENDERS.map(wordRe);
export const senderLooksRecruiter = (from = "") => SENDER_RES.some((re) => re.test(from.replace(/[._@<>-]/g, " ")));

export function buildAuthUrl({ clientId, redirectUri, state }) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

async function tokenCall(body, fetchImpl = fetch) {
  const res = await fetchImpl("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error_description || data.error || "Google token call failed");
    err.code = data.error;
    throw err;
  }
  return data;
}

export const exchangeCode = ({ code, clientId, clientSecret, redirectUri }, f) =>
  tokenCall({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: "authorization_code" }, f);

export const refreshAccessToken = ({ refreshToken, clientId, clientSecret }, f) =>
  tokenCall({ refresh_token: refreshToken, client_id: clientId, client_secret: clientSecret, grant_type: "refresh_token" }, f);

// Gmail sends the email address in the signed id_token. We only read it after a direct call to Google's token endpoint.
export function emailFromIdToken(idToken) {
  const payload = JSON.parse(Buffer.from(String(idToken).split(".")[1], "base64url").toString("utf8"));
  return payload.email_verified ? String(payload.email).toLowerCase() : null;
}

const b64 = (s) => Buffer.from(s, "base64url").toString("utf8");

const stripHtml = (html) =>
  html
    .replace(/<(style|script)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>|<\/p>|<\/div>|<\/tr>|<\/li>/gi, "\n")
    .replace(/<a\s[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, "$2 ($1)")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();

function collect(part, out) {
  if (!part) return;
  if (part.body?.data && part.mimeType === "text/plain") out.plain.push(b64(part.body.data));
  else if (part.body?.data && part.mimeType === "text/html") out.html.push(b64(part.body.data));
  for (const p of part.parts ?? []) collect(p, out);
}

// Plain text of a Gmail message payload. Prefers text/plain, falls back to HTML with the tags removed.
export function bodyText(payload) {
  const out = { plain: [], html: [] };
  collect(payload, out);
  if (out.plain.join("").trim()) return out.plain.join("\n").trim();
  return stripHtml(out.html.join("\n"));
}

export const header = (payload, name) =>
  payload?.headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";

export async function gmailGet(path, accessToken, fetchImpl = fetch) {
  const res = await fetchImpl(`https://gmail.googleapis.com/gmail/v1/users/me/${path}`, {
    headers: { authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    const err = new Error(`Gmail call failed with status ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}
