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
  "EVAL_KEY",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
];

export function GET() {
  const present = {};
  for (const name of NAMES) present[name] = Boolean(process.env[name]);
  // Shapes only, never values: lets us spot a stray space or a stale deployment.
  const demo = {
    emailLength: process.env.DEMO_EMAIL?.length ?? 0,
    evalKeyLength: process.env.EVAL_KEY?.length ?? 0,
    passwordLength: process.env.DEMO_PASSWORD?.length ?? 0,
    hasStraySpace:
      process.env.DEMO_EMAIL !== process.env.DEMO_EMAIL?.trim() ||
      process.env.DEMO_PASSWORD !== process.env.DEMO_PASSWORD?.trim(),
  };
  const build = (process.env.VERCEL_GIT_COMMIT_SHA || "local").slice(0, 7);
  return Response.json({ ok: true, build, present, demo });
}
