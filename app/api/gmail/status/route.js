import { adminClient } from "../../../../lib/admin.mjs";
import { userFromRequest } from "../../../../lib/push.mjs";

export const dynamic = "force-dynamic";

// Whether the signed-in person's Gmail is connected, and whether Google has ended that access.
export async function GET(request) {
  const admin = adminClient();
  const user = await userFromRequest(admin, request);
  if (!user) return Response.json({ error: "Please sign in." }, { status: 401 });
  const { data } = await admin.from("gmail_tokens").select("broken_at").eq("user_id", user.id).maybeSingle();
  return Response.json({ connected: Boolean(data), broken: Boolean(data?.broken_at) });
}
