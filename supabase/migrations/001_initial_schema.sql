-- SubCycle Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Taste profiles table
create table public.taste_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  favorite_shows text[] default '{}',
  genres text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Services table (master list of streaming services)
create table public.services (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  logo_url text,
  default_price decimal(10,2),
  tmdb_provider_id integer,
  cancel_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Subscriptions table
create type subscription_status as enum ('active', 'paused');

create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  service_id uuid references public.services on delete cascade not null,
  status subscription_status default 'active' not null,
  monthly_cost decimal(10,2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, service_id)
);

-- Reminders table
create type reminder_type as enum ('cancel', 'resubscribe');

create table public.reminders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  subscription_id uuid references public.subscriptions on delete cascade not null,
  type reminder_type not null,
  trigger_date date not null,
  triggered boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Content table (cached TMDB content)
create type content_type as enum ('movie', 'tv');

create table public.content (
  id uuid default uuid_generate_v4() primary key,
  tmdb_id integer not null unique,
  type content_type not null,
  title text not null,
  release_date date,
  genres text[] default '{}',
  service_ids uuid[] default '{}',
  cached_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.taste_profiles enable row level security;
alter table public.services enable row level security;
alter table public.subscriptions enable row level security;
alter table public.reminders enable row level security;
alter table public.content enable row level security;

-- Profiles: users can only see/update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Taste profiles: users can only access their own
create policy "Users can view own taste profile"
  on public.taste_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own taste profile"
  on public.taste_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own taste profile"
  on public.taste_profiles for update
  using (auth.uid() = user_id);

-- Services: everyone can read
create policy "Anyone can view services"
  on public.services for select
  to authenticated
  using (true);

-- Subscriptions: users can only access their own
create policy "Users can view own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert own subscriptions"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own subscriptions"
  on public.subscriptions for update
  using (auth.uid() = user_id);

create policy "Users can delete own subscriptions"
  on public.subscriptions for delete
  using (auth.uid() = user_id);

-- Reminders: users can only access their own
create policy "Users can view own reminders"
  on public.reminders for select
  using (auth.uid() = user_id);

create policy "Users can insert own reminders"
  on public.reminders for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reminders"
  on public.reminders for update
  using (auth.uid() = user_id);

create policy "Users can delete own reminders"
  on public.reminders for delete
  using (auth.uid() = user_id);

-- Content: everyone can read (cached public data)
create policy "Anyone can view content"
  on public.content for select
  to authenticated
  using (true);

-- Function to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
