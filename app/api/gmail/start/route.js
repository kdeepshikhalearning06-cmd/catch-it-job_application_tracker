import { randomBytes } from "node:crypto";
import { buildAuthUrl } from "../../../../lib/gmail.mjs";

export const dynamic = "force-dynamic";

// Sends the person to Google to allow read-only Gmail access.
export async function GET(request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return Response.json({ error: "Gmail is not set up yet." }, { status: 500 });
  const redirectUri = `${new URL(request.url).origin}/api/gmail/callback`;
  const state = randomBytes(16).toString("hex");
  const res = Response.redirect(buildAuthUrl({ clientId, redirectUri, state }), 302);
  res.headers.append("set-cookie", `catchit_oauth=${state}; HttpOnly; Secure; SameSite=Lax; Path=/api/gmail; Max-Age=600`);
  return res;
}
