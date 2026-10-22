# Catchit: build plan

Written Thu 22 Oct 2026, night. Internal finish: Sun 25 Oct night. Submit by Mon 26 Oct noon.
Rule for every slice: it ends with a commit pushed to GitHub and a working live Vercel link. No slice is "done" until a person other than the builder can use it.

## Priority list (freeze, cut from the bottom)

| Rank | Item | Slice |
|---|---|---|
| Must | Demo login + seeded sample inbox | 1, 2 |
| Must | AI extraction (strict JSON, never invents a date) | 1 |
| Must | Review screen: Confirm, Edit, Dismiss, saved | 2 |
| Must | Today list: Done, Snooze, saved | 2 |
| Should | Test set + eval script | 3 |
| Should | Gmail connect and scan (hard stop Sat 2 pm) | 4 |
| Should | Morning reminder email | 5 |
| Could | Calendar file with two alarms | 5 |
| Could | "My name" rename | 5 |
| Could | Week strip on Today | 5 |
| Could | Privacy page, Disconnect and delete | 6 |
| Stretch | "Send to Catchit" Chrome extension | only if everything above works |

## Slices

### Slice 0: accounts and skeleton (Thu night, about 1 hour)
- Deepshikha creates: a Supabase project, an Anthropic Console account with a $5 to $10 prepaid balance and an API key, a Resend account. Claude gives the exact steps for each.
- Claude: folder structure, Supabase schema, environment variable list, a `/api/health` route.
- Keys go only into Vercel's environment settings, never into the repo.
- Done when: the Vercel site still loads and `/api/health` answers.

### Slice 1: extraction on sample emails (Fri morning)
- 10 labelled sample emails with dates set relative to today (assessment, interview invite, document upload, two non-actions, a reschedule, a two-deadline email, one with no date).
- Extraction function: one email in, strict JSON out (company, role, action, deadline, link, evidence, confidence). Rules: no written date means null, the evidence sentence must appear in the email, email text is data and never instructions.
- Code checks: valid JSON, evidence found in the email, deadline in the future of the received date.
- Done when: all 10 sample emails give the expected result from a script run, committed.

### Slice 2: the core journey with the demo login (Fri midday to afternoon)
- Demo login (email and password in Vercel settings), Review screen, Today screen (list first, week strip later), Confirm, Edit, Dismiss, Done, Snooze, all saved in Supabase.
- Phone and laptop layouts from the sketches, ivory, emerald and vermilion palette.
- "Reset demo" button.
- Done when: a stranger logs in with the demo account on a phone, confirms a card, sees it on Today, and it is still there after a refresh.

### Slice 3: test set and manual add (Fri evening)
- 30-email test set (15 real actions, 10 non-actions, 5 tricky) from Deepshikha's 5 real redacted emails plus samples labelled as samples. Eval script scores with code. Target: 90% on action found and on exact deadline, zero invented deadlines.
- "Add manually" backup, empty and error states, scanning state.
- Done when: the eval result is saved in the repo and the result is on a deck slide draft.

### Slice 4: Gmail connect (Sat morning, hard stop 2 pm)
- Google Cloud project, Gmail read-only scope, testing mode, tester addresses added as test users, Google sign-in, scan of the last 14 days (50 emails at most, keyword filter), saved Gmail message ids so nothing repeats.
- If it is not working at 2 pm: stop, ship demo plus manual add, show Gmail as "coming next".
- Done when: Deepshikha's own Gmail produces proposals in Review.

### Slice 5: reminders and extras (Sat afternoon)
- Morning reminder email (Resend plus a once-a-day Vercel job, arriving between 8 and 9 am IST), "Send me a test reminder" button, test scheduler for the testing week.
- Then, in this order and only if time allows: calendar file with two alarms (test on Android and iPhone), "My name", week strip.

### Slice 6: testers, privacy, deck (Sat evening to Sun)
- Privacy page, Disconnect and delete button, landing page copy, "unverified app" instructions for testers.
- Sunday: 3 to 5 testers use it without help; written feedback; fix the top 2 problems; 10-slide deck opening with a user story; launch message sent to named first users.

### Mon 26 Oct: buffer
- Incognito check on phone and laptop, full demo run, demo login in the submission, submit before noon.

## Who does what

| Day | Deepshikha | Claude |
|---|---|---|
| Thu night | Create Supabase, Anthropic Console, Resend accounts | Slice 0 steps and code |
| Fri morning | 20-minute test of Simplify and G-Track; LinkedIn email-notification check; 5 real recruiter emails with names removed | Slice 1 |
| Fri | Try each deployed slice on phone and laptop, report what breaks | Slices 2 and 3 |
| Fri evening | Remaining 3 tester Gmail addresses; 10 names for first users | Google Cloud setup steps |
| Sat | Add testers as Google test users (steps provided); check calendar file on phone | Slices 4 and 5 |
| Sun | Run tester sessions; write feedback notes | Fixes, privacy page, deck draft |

## Data model (first version)

- `items`: id, user_id, source (demo, gmail, manual), gmail_message_id (unique per user), company, role, action, my_name, deadline, link, evidence, confidence, status (proposed, confirmed, dismissed, done), stage (applied, assessment, interview, offer, rejected), snoozed_until, created_at.
- `scan_state`: user_id, last_scan_at.
- Auth: Supabase sign-in. Demo user is a normal user with source = demo items.

## Server routes

`/api/extract`, `/api/scan`, `/api/items`, `/api/demo/reset`, `/api/test-reminder`, `/api/cron/daily`, `/api/ics/[id]`.

## Commit rhythm

At least 4 commits a day, one per working slice, with messages that say what a person can now do. Steady commits are checked.

## Risks and answers

| Risk | Answer |
|---|---|
| Gmail connect eats Saturday | Hard stop at 2 pm, fall back to demo plus manual add |
| Wrong or invented deadline | Null when no date written; evidence must appear in the email; eval guardrail of zero |
| Model costs or key leaks | Server-side key only, prepaid balance with a small cap, trimmed email bodies |
| Judges have no Gmail | Demo login with relative dates and a reset button |
| Free-plan cron limits | One daily run; email arrives between 8 and 9 am; documented |
| Scope grows | The priority list above is frozen; new ideas go below the line |
