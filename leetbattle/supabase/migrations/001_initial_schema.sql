-- ─────────────────────────────────────────────────────────────────────────────
-- LeetBattle — initial schema
-- Run via: supabase db push  (or paste into the Supabase SQL editor)
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ── profiles ─────────────────────────────────────────────────────────────────
-- One row per user; mirrors auth.users via id FK.
create table if not exists profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  username        text unique not null,
  email           text not null,
  elo             integer not null default 1200 check (elo >= 100),
  match_count     integer not null default 0,
  wins            integer not null default 0,
  losses          integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Keep updated_at fresh
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function touch_updated_at();

-- ── matches ───────────────────────────────────────────────────────────────────
create table if not exists matches (
  id                  text primary key,
  player_a_id         uuid not null references profiles(id),
  player_b_id         uuid not null references profiles(id),
  difficulty          text not null check (difficulty in ('easy','medium','hard')),
  status              text not null default 'pending'
                        check (status in ('pending','active','completed','forfeited','expired')),
  winner_id           uuid references profiles(id),
  forfeited_by        uuid references profiles(id),
  player_a_delta      integer,
  player_b_delta      integer,
  player_a_submission jsonb,
  player_b_submission jsonb,
  started_at          timestamptz,
  completed_at        timestamptz,
  created_at          timestamptz not null default now()
);

create index matches_player_a_idx on matches(player_a_id);
create index matches_player_b_idx on matches(player_b_id);
create index matches_created_at_idx on matches(created_at desc);

-- ── anticheat_events ──────────────────────────────────────────────────────────
create table if not exists anticheat_events (
  id         bigserial primary key,
  match_id   text not null references matches(id) on delete cascade,
  user_id    uuid not null references profiles(id),
  type       text not null,   -- 'tab_blur' | 'face_lost' | 'paste_detected'
  details    jsonb,
  created_at timestamptz not null default now()
);

create index anticheat_match_idx on anticheat_events(match_id);
create index anticheat_user_idx  on anticheat_events(user_id);

-- ── Row Level Security ────────────────────────────────────────────────────────
alter table profiles           enable row level security;
alter table matches            enable row level security;
alter table anticheat_events   enable row level security;

-- profiles: public reads, own-row writes
create policy "profiles_public_read"  on profiles for select using (true);
create policy "profiles_own_update"   on profiles for update using (auth.uid() = id);

-- matches: participants can read their own matches
create policy "matches_participant_read" on matches for select
  using (auth.uid() = player_a_id or auth.uid() = player_b_id);

-- anticheat_events: only visible to the player themselves
create policy "anticheat_own_read" on anticheat_events for select
  using (auth.uid() = user_id);

-- ── Auto-create profile on signup ─────────────────────────────────────────────
-- (Belt-and-suspenders alongside the API route)
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, username, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
