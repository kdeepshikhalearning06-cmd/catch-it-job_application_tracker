-- Gmail refresh tokens (server only: RLS on, no policies) and which emails were already read.
create table if not exists public.gmail_tokens (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  refresh_token text not null,
  connected_at timestamptz not null default now()
);
alter table public.gmail_tokens enable row level security;

create table if not exists public.scanned_messages (
  user_id uuid not null references auth.users(id) on delete cascade,
  message_id text not null,
  scanned_at timestamptz not null default now(),
  primary key (user_id, message_id)
);
alter table public.scanned_messages enable row level security;
