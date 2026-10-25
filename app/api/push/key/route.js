export const dynamic = "force-dynamic";

// The public half of the push key pair. Browsers need it to subscribe. Safe to share.
export function GET() {
  const key = process.env.VAPID_PUBLIC_KEY?.trim();
  if (!key) return Response.json({ error: "Reminders are not set up yet." }, { status: 503 });
  return Response.json({ key });
}
