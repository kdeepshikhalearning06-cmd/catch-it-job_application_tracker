import { adminClient } from "../../../../lib/admin.mjs";
import { scanUser, NotConnected } from "../../../../lib/scanUser.mjs";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Reads the signed-in person's last 14 days of Gmail (read-only), finds actions, and saves them as proposed.
export async function POST(request) {
  const token = /^Bearer (.+)$/.exec(request.headers.get("authorization") ?? "")?.[1];
  if (!token) return Response.json({ error: "Please sign in." }, { status: 401 });

  const admin = adminClient();
  const { data: auth } = await admin.auth.getUser(token);
  const user = auth?.user;
  if (!user) return Response.json({ error: "Please sign in again." }, { status: 401 });

  const { data: saved } = await admin.from("gmail_tokens").select("*").eq("user_id", user.id).maybeSingle();
  if (!saved) return Response.json({ error: "not_connected" }, { status: 400 });

  try {
    const force = new URL(request.url).searchParams.get("force") === "1";
    const r = await scanUser(admin, saved, { force });
    return Response.json({ ok: true, email: r.email, found: r.found.length, read: r.read, failed: r.failed, total: r.total, left: r.left });
  } catch (err) {
    if (err instanceof NotConnected) return Response.json({ error: "not_connected" }, { status: 400 });
    console.error("scan failed", err?.message, err?.code);
    return Response.json({ error: "The scan did not finish. Try again in a minute." }, { status: 500 });
  }
}
