// Small Gmail helpers: Google sign-in URLs, token calls, and turning a message into plain text.

export const SCOPE = "openid email https://www.googleapis.com/auth/gmail.readonly";

// Read-only search: last 14 days, not sent by the user, not promotions, and words that recruiters use.
export const SEARCH =
  'newer_than:14d -in:sent -in:chats -category:promotions -category:social ' +
  '(interview OR assessment OR assignment OR task OR deadline OR "last date" OR shortlisted OR "next round" OR test OR invitation OR schedule OR submit OR application OR selected OR exam OR examination OR "admit card" OR "hall ticket" OR scheduled OR reporting OR reminder OR "last day" OR due OR register OR registration)';

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
