-- 12 Nov 2026, for the resubmission.
-- broken_at: when Google stopped accepting the saved Gmail token (null = working). Set by the scan, cleared on reconnect.
alter table public.gmail_tokens add column if not exists broken_at timestamptz;

-- The person's answer on a Review card: had they already seen this email, or had they missed it?
alter table public.items add column if not exists seen_before text check (seen_before in ('seen', 'missed'));

-- Request-access form on the landing page. Server only: RLS on, no policies; written by /api/access.
create table if not exists public.access_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  email text not null check (char_length(email) between 3 and 200),
  college text check (char_length(college) <= 120),
  created_at timestamptz not null default now()
);
alter table public.access_requests enable row level security;

-- Every connection made while the Google app was in "Testing" mode was ended by Google after 7 days.
-- Mark those quietly, so the app shows "Reconnect Gmail" without a burst of pushes on the first run.
update public.gmail_tokens set broken_at = now() where broken_at is null and connected_at < now() - interval '7 days';
