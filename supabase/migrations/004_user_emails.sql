-- Phase 7b: User Emails table for Gmail integration
-- Stores connected email accounts for subscription detection

create table user_emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text not null,
  provider text not null default 'gmail',
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  created_at timestamptz default now(),
  unique(user_id, email)
);

-- Enable RLS
alter table user_emails enable row level security;

-- Users can only manage their own connected emails
create policy "Users can manage own emails" on user_emails
  for all using (auth.uid() = user_id);
