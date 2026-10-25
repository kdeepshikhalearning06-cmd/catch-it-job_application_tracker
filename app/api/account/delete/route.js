import { adminClient } from "../../../../lib/admin.mjs";
import { userFromRequest } from "../../../../lib/push.mjs";

export const dynamic = "force-dynamic";

// Deletes the account and everything saved for it (items, Gmail token, devices). Cannot be undone.
export async function POST(request) {
  const admin = adminClient();
  const user = await userFromRequest(admin, request);
  if (!user) return Response.json({ error: "Please sign in again." }, { status: 401 });
  if (user.email?.toLowerCase() === process.env.DEMO_EMAIL?.trim().toLowerCase()) {
    return Response.json({ error: "The shared demo account can't be deleted. Use Reset demo instead." }, { status: 400 });
  }

  const { data: saved } = await admin.from("gmail_tokens").select("refresh_token").eq("user_id", user.id).maybeSingle();
  if (saved?.refresh_token) {
    await fetch("https://oauth2.googleapis.com/revoke", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token: saved.refresh_token }),
    }).catch(() => {});
  }
  // Every table points at the user with "on delete cascade", so this removes all of their rows too.
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("delete account failed", error.message);
    return Response.json({ error: "Could not delete the account. Try again." }, { status: 500 });
  }
  return Response.json({ ok: true });
}
