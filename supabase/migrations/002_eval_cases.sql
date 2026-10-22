-- Private test emails for the accuracy check. RLS on with no policies: only the service role can read.
create table if not exists public.eval_cases (
  id serial primary key,
  label text not null,
  from_addr text,
  subject text,
  received_at timestamptz not null,
  body text not null,
  expected_deadlines jsonb not null default '[]'
);
alter table public.eval_cases enable row level security;
