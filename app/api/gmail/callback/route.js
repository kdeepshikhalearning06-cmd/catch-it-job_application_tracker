import { adminClient, anonClient } from "../../../../lib/admin.mjs";
import { exchangeCode, emailFromIdToken } from "../../../../lib/gmail.mjs";

export const dynamic = "force-dynamic";

const back = (origin, reason) => Response.redirect(`${origin}/login?gmail=${reason}`, 302);

// Google sends the person back here. We swap the code for tokens, find or create their Catchit account
// from the verified Google email, keep the refresh token on the server, and hand the browser a session.
export async function GET(request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookie = /(?:^|;\s*)catchit_oauth=([^;]+)/.exec(request.headers.get("cookie") ?? "")?.[1];
  if (url.searchParams.get("error")) return back(origin, "denied");
  if (!code || !state || state !== cookie) return back(origin, "state");

  try {
    const tokens = await exchangeCode({
      code,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: `${origin}/api/gmail/callback`,
    });
    const email = emailFromIdToken(tokens.id_token);
    if (!email || !tokens.refresh_token) return back(origin, "token");

    const admin = adminClient();
    // Create the account first. A magic link made for a brand-new email is a sign-up link,
    // which the magiclink check below rejects, so every first connect used to fail once.
    const { error: createError } = await admin.auth.admin.createUser({ email, email_confirm: true });
    if (createError && createError.code !== "email_exists" && createError.status !== 422) throw createError;

    const { data: link, error: linkError } = await admin.auth.admin.generateLink({ type: "magiclink", email });
    if (linkError) throw linkError;
    const userId = link.user.id;

    const { error: saveError } = await admin
      .from("gmail_tokens")
      .upsert({ user_id: userId, email, refresh_token: tokens.refresh_token, connected_at: new Date().toISOString() });
    if (saveError) throw saveError;

    const { data: verified, error: verifyError } = await anonClient().auth.verifyOtp({
      token_hash: link.properties.hashed_token,
      type: "magiclink",
    });
    if (verifyError) throw verifyError;

    const { access_token, refresh_token } = verified.session;
    const headers = new Headers({ location: `${origin}/auth/finish#access_token=${access_token}&refresh_token=${refresh_token}` });
    headers.append("set-cookie", "catchit_oauth=; HttpOnly; Secure; Path=/api/gmail; Max-Age=0");
    return new Response(null, { status: 302, headers });
  } catch (err) {
    console.error("gmail callback failed", err?.message);
    return back(origin, "failed");
  }
}
