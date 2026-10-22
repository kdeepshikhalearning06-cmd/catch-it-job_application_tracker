-- Applied to the Supabase project on 22 Oct 2026.
create table public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null check (source in ('demo', 'gmail', 'manual')),
  gmail_message_id text,
  company text,
  role text,
  action text not null,
  my_name text,
  deadline timestamptz,
  link text,
  evidence text,
  confidence text check (confidence in ('high', 'medium', 'low')),
  status text not null default 'proposed' check (status in ('proposed', 'confirmed', 'dismissed', 'done')),
  stage text not null default 'applied' check (stage in ('applied', 'assessment', 'interview', 'offer', 'rejected')),
  snoozed_until timestamptz,
  received_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index items_user_message_action_key
  on public.items (user_id, gmail_message_id, action)
  where gmail_message_id is not null;

create index items_user_status_deadline_idx
  on public.items (user_id, status, deadline);

create table public.scan_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_scan_at timestamptz
);

alter table public.items enable row level security;
alter table public.scan_state enable row level security;

create policy "items_owner_all" on public.items
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "scan_state_owner_all" on public.scan_state
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
