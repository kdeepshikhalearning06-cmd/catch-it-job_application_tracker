# Catchit

Catchit catches what companies ask you to do, before it slips.

A fresher applying to several roles a week connects Gmail once. Catchit reads the last 14 days (read-only), finds assessment links, interview invites, exam dates and deadlines, and proposes "do X by Y" with the exact sentence from the email. The user confirms, edits or dismisses. Confirmed items sit on a Today list with a week strip.

**Live:** https://catch-it-jobapplicationtracker.vercel.app (use "Try the demo" for a sample inbox, no sign-in needed)

Built for the HelloPM Buildathon 2026. Spec: [SPEC.md](SPEC.md). Plan: [BUILD_PLAN.md](BUILD_PLAN.md).

## Status (25 Oct 2026, night)

Live and tested by 5 people (4 on their own Gmail). Across testers' inboxes, Catchit found 8 of 10 real actions, all 8 correct, with 0 wrong dates.

| Built | Next |
|---|---|
| Landing page, demo account, light and dark mode | Re-run the 30-case accuracy test once the AI quota is back |
| Review: confirm, edit, dismiss, with a flag on items Catchit isn't sure about | "Share to Catchit" for LinkedIn DMs and WhatsApp |
| Today: next-up countdown, overdue, due today, coming up, week strip | Google verification (removes the unverified-app screen) |
| Detail, Add a task, Account (theme, Gmail, delete my data), Privacy | |
| Gmail connect (read-only, 14 days), background scan every 15 minutes | |
| Phone notifications a day and 2 hours before, Add to calendar | |
| Code checks on every AI answer; job-board ads and scam fee requests filtered | |

What changed after testers: the first Gmail connect no longer fails for new users; the app was redesigned (3 of 5 testers said it looked weak); Today shows what's coming up, not only today; job-board alerts no longer become tasks.

## How it works

1. Gmail search (last 14 days, recruiter-style words in the subject or a recruiter-style sender, not sent mail) finds candidate emails. Bank, card and bill emails are skipped before the AI sees them.
2. Job-board alert senders are skipped. One model call per email returns strict JSON. Code then checks that the quoted evidence really is in the email, that a deadline has a date cue, and that a link appears in the email. Anything that fails is dropped, never guessed. A no-date "apply for this role" is treated as an ad and dropped.
3. Proposals land in Review. The person decides. Only confirmed items reach Today.
4. Reminders: Catchit is installable (Add to Home Screen) and sends web push notifications. A background job runs every 15 minutes (Supabase pg_cron calling `/api/cron/notify`, because Vercel's free plan allows only one cron a day). It reads new Gmail for connected people and pushes "Catchit found N new", then pushes a reminder about a day before and 2 hours before each confirmed deadline. On iPhone, notifications need iOS 16.4 or later and Catchit added to the Home Screen.
5. "Add to calendar" opens a prefilled Google Calendar event. No calendar permission is requested.

Accuracy: the extraction is tested on sample emails and on real recruiter emails kept in a private table (not in this repo). See `lib/extract.mjs` and `test/`.

Latest full run (26 Oct 2026, live site, Groq gpt-oss-120b, 39 cases: 7 real emails and 32 hard synthetic ones such as Hinglish, missing years, reschedules, GMT times, forwards, scams and a prompt injection): 38 of 39 actions right, 38 of 39 deadlines right after one prompt fix, 0 invented deadlines. The one miss is the prompt-injection newsletter: the model did not obey the hidden instruction but showed a scam warning where nothing was expected. Run it with `/api/eval?key=EVAL_KEY&from=1&to=10` (slices keep the free tier's per-minute limit happy).

## Run it yourself

```
npm install
npm test
npm run dev
```

Environment variables (names only, set them in Vercel or `.env.local`):
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GROQ_API_KEY` (the live model: free tier, gpt-oss-120b with two backup models when a daily limit runs out), or `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `OPENROUTER_API_KEY` (order of preference: Claude, OpenRouter, Groq, Gemini), `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `DEMO_EMAIL`, `DEMO_PASSWORD`, `EVAL_KEY`, `RESEND_API_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `CRON_SECRET`.

Database: apply the files in `supabase/migrations/` in order.

## Stack

Next.js (App Router) on Vercel, Supabase (auth, Postgres with row-level security), Groq (gpt-oss-120b, free tier) for extraction, swappable for Gemini, OpenRouter or Claude, Gmail API (read-only).
