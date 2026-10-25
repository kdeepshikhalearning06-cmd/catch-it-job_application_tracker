import { adminClient } from "../../../../lib/admin.mjs";
import { userFromRequest } from "../../../../lib/push.mjs";

export const dynamic = "force-dynamic";

// Saves this browser or phone as a place to send reminders for the signed-in person.
export async function POST(request) {
  const admin = adminClient();
  const user = await userFromRequest(admin, request);
  if (!user) return Response.json({ error: "Please sign in again." }, { status: 401 });

  const { subscription } = await request.json().catch(() => ({}));
  const endpoint = subscription?.endpoint;
  const { p256dh, auth } = subscription?.keys ?? {};
  if (!endpoint?.startsWith("https://") || !p256dh || !auth) {
    return Response.json({ error: "That device could not be saved." }, { status: 400 });
  }
  const { error } = await admin.from("push_subscriptions").upsert({
    endpoint,
    user_id: user.id,
    p256dh,
    auth,
    user_agent: request.headers.get("user-agent")?.slice(0, 200) ?? null,
  });
  if (error) {
    console.error("save subscription failed", error.message);
    return Response.json({ error: "That device could not be saved." }, { status: 500 });
  }
  return Response.json({ ok: true });
}

// Stops reminders on one device.
export async function DELETE(request) {
  const admin = adminClient();
  const user = await userFromRequest(admin, request);
  if (!user) return Response.json({ error: "Please sign in again." }, { status: 401 });
  const { endpoint } = await request.json().catch(() => ({}));
  if (endpoint) await admin.from("push_subscriptions").delete().eq("user_id", user.id).eq("endpoint", endpoint);
  return Response.json({ ok: true });
}
