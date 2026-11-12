import { adminClient } from "../../../lib/admin.mjs";

export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (v, max) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

// Request-access form on the landing page. Saves name, email and college so Deepshikha can invite people
// while Google verification is pending. Nothing else is stored, and nothing is sent to anyone.
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  if (body.website) return Response.json({ ok: true }); // hidden field: bots fill it, people don't
  const name = clean(body.name, 80);
  const email = clean(body.email, 200).toLowerCase();
  const college = clean(body.college, 120) || null;
  if (!name) return Response.json({ error: "Please add your name." }, { status: 400 });
  if (!EMAIL.test(email)) return Response.json({ error: "Please check your email address." }, { status: 400 });

  const admin = adminClient();
  const { count } = await admin.from("access_requests").select("id", { count: "exact", head: true }).eq("email", email);
  if (count) return Response.json({ ok: true, again: true });
  const { error } = await admin.from("access_requests").insert({ name, email, college });
  if (error) {
    console.error("access request failed", error.message);
    return Response.json({ error: "That didn't go through. Please try again." }, { status: 500 });
  }
  return Response.json({ ok: true });
}
