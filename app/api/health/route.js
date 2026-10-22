// Reports which settings exist, never their values.
export const dynamic = "force-dynamic";

const NAMES = [
  "RESEND_API_KEY",
  "GEMINI_API_KEY",
  "ANTHROPIC_API_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DEMO_EMAIL",
  "DEMO_PASSWORD",
];

export function GET() {
  const present = {};
  for (const name of NAMES) present[name] = Boolean(process.env[name]);
  return Response.json({ ok: true, present });
}
