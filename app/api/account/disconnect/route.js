import { adminClient } from "../../../../lib/admin.mjs";
import { userFromRequest } from "../../../../lib/push.mjs";

export const dynamic = "force-dynamic";

// Stops Catchit reading Gmail: revokes Google access and forgets the token. Saved items stay.
export async function POST(request) {
  const admin = adminClient();
  const user = await userFromRequest(admin, request);
  if (!user) return Response.json({ error: "Please sign in again." }, { status: 401 });

  const { data: saved } = await admin.from("gmail_tokens").select("refresh_token").eq("user_id", user.id).maybeSingle();
  if (saved?.refresh_token) {
    await fetch("https://oauth2.googleapis.com/revoke", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token: saved.refresh_token }),
    }).catch(() => {});
  }
  await admin.from("gmail_tokens").delete().eq("user_id", user.id);
  await admin.from("scanned_messages").delete().eq("user_id", user.id);
  return Response.json({ ok: true });
}
