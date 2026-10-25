-- Phone and browser push: saved devices and which reminders were already sent.
-- Server only: RLS on, no policies, so only the service role reads or writes these.
create table if not exists public.push_subscriptions (
  endpoint text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists push_subscriptions_user_idx on public.push_subscriptions (user_id);
alter table public.push_subscriptions enable row level security;

create table if not exists public.sent_reminders (
  item_id uuid not null references public.items(id) on delete cascade,
  kind text not null check (kind in ('day', 'hours')),
  sent_at timestamptz not null default now(),
  primary key (item_id, kind)
);
alter table public.sent_reminders enable row level security;
