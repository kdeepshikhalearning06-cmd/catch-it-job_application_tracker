import { createClient } from "@supabase/supabase-js";
import { adminClient } from "../../../lib/admin.mjs";

export const dynamic = "force-dynamic";

const signIn = (email, password) =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).auth.signInWithPassword({ email, password });

// Anyone in the shared demo can change its password from the browser, which would lock the next
// visitor out. If sign-in fails, put the password back on the server and try once more.
async function repairDemo(email, password) {
  const admin = adminClient();
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
    if (error) return;
    const user = data.users.find((u) => u.email?.toLowerCase() === email);
    if (user) {
      await admin.auth.admin.updateUserById(user.id, { password });
      return;
    }
    if (data.users.length < 100) return;
  }
}

// Signs in as the shared demo user and hands the session to the browser.
// The demo password never leaves the server.
export async function POST() {
  const email = process.env.DEMO_EMAIL?.trim().toLowerCase();
  const password = process.env.DEMO_PASSWORD?.trim();
  if (!email || !password) {
    return Response.json({ error: "The demo account is not set up yet." }, { status: 500 });
  }
  let { data, error } = await signIn(email, password);
  if (error || !data.session) {
    await repairDemo(email, password).catch(() => {});
    ({ data, error } = await signIn(email, password));
  }
  if (error || !data.session) {
    return Response.json({ error: "The demo account could not sign in." }, { status: 500 });
  }
  return Response.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
}
