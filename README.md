# Catchit

Catchit catches what companies ask you to do, before it slips.

A fresher applying to several roles a week connects Gmail once. Catchit reads the last 14 days (read-only), finds assessment links, interview invites, exam dates and deadlines, and proposes "do X by Y" with the exact sentence from the email. The user confirms, edits or dismisses. Confirmed items sit on a Today list with a week strip.

**Live:** https://catch-it-jobapplicationtracker.vercel.app (use "Try the demo" for a sample inbox, no sign-in needed)

Built for the HelloPM Buildathon 2026. Spec: [SPEC.md](SPEC.md). Plan: [BUILD_PLAN.md](BUILD_PLAN.md).

## Status (22 Oct 2026)

| Done | Not done yet |
|---|---|
| Landing page, demo account, Today with week strip | Reminders: morning email, phone calendar alarm, test reminder |
| Review: confirm, edit (with "my name"), dismiss | Privacy page, Disconnect Gmail, Delete my data |
| Detail screen (stage, notes), Add manually | Laptop side-by-side layout |
| Gmail connect (read-only, last 14 days) and scan | Tester sessions and feedback |
| Extraction with code checks (no invented deadlines) | Larger accuracy test set |

## How it works

1. Gmail search (last 14 days, recruiter-style words, not sent mail) finds candidate emails.
2. One model call per email returns strict JSON. Code then checks that the quoted evidence really is in the email, that a deadline has a date cue, and that a link appears in the email. Anything that fails is dropped, never guessed.
3. Proposals land in Review. The person decides. Only confirmed items reach Today.

Accuracy: the extraction is tested on sample emails and on real recruiter emails kept in a private table (not in this repo). See `lib/extract.mjs` and `test/`.

## Run it yourself

```
npm install
npm test
npm run dev
```

Environment variables (names only, set them in Vercel or `.env.local`):
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `ANTHROPIC_API_KEY` (optional; used for real inbox mail when set), `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `DEMO_EMAIL`, `DEMO_PASSWORD`, `EVAL_KEY`, `RESEND_API_KEY`.

Database: apply the files in `supabase/migrations/` in order.

## Stack

Next.js (App Router) on Vercel, Supabase (auth, Postgres with row-level security), Gemini or Claude for extraction, Gmail API (read-only).
