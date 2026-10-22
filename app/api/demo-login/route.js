import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Signs in as the shared demo user and hands the session to the browser.
// The demo password never leaves the server.
export async function POST() {
  const email = process.env.DEMO_EMAIL;
  const password = process.env.DEMO_PASSWORD;
  if (!email || !password) {
    return Response.json({ error: "The demo account is not set up yet." }, { status: 500 });
  }
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    return Response.json({ error: "The demo account could not sign in." }, { status: 500 });
  }
  return Response.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
}
