-- Enable UUID extension if not present
create extension if not exists "uuid-ossp";

-- ── Profiles ─────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid references auth.users (id) on delete cascade not null primary key,
  username text unique not null,
  email text not null,
  elo integer default 1200 not null,
  match_count integer default 0 not null,
  wins integer default 0 not null,
  losses integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Trigger for updated_at
create or function public.handle_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- Auto-create profile trigger when user is created
create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, username, email)
  values (new.id, new.raw_user_meta_data->>'username', new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Matches ──────────────────────────────────────────────────────────────
create table public.matches (
  id text not null primary key,
  player_a_id uuid references public.profiles(id) not null,
  player_b_id uuid references public.profiles(id) not null,
  difficulty text not null,
  status text not null, -- pending, active, completed, forfeited, expired
  winner_id uuid references public.profiles(id),
  forfeited_by uuid references public.profiles(id),
  player_a_delta integer,
  player_b_delta integer,
  player_a_submission jsonb,
  player_b_submission jsonb,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.matches enable row level security;
create policy "Users can view matches they are part of." on public.matches for select 
using (auth.uid() = player_a_id or auth.uid() = player_b_id);

-- ── Anti-Cheat Events ────────────────────────────────────────────────────
create table public.anticheat_events (
  id uuid default uuid_generate_v4() primary key,
  match_id text references public.matches(id) not null,
  user_id uuid references public.profiles(id) not null,
  type text not null, -- tab_blur | face_lost | paste_detected
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.anticheat_events enable row level security;
create policy "Users can view their own anticheat events." on public.anticheat_events for select 
using (auth.uid() = user_id);
