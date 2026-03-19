-- ============================================================
-- LeetBattle — Supabase migration
-- Run this in the Supabase SQL editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable UUID helper (already on by default in Supabase)
create extension if not exists "pgcrypto";

-- ── profiles ────────────────────────────────────────────────
-- One row per auth.users entry. Created via trigger on signup.
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique not null,
  avatar_url    text,
  elo           int not null default 1200,
  wins          int not null default 0,
  losses        int not null default 0,
  win_streak    int not null default 0,
  matches_played int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-create a profile whenever a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── problems ────────────────────────────────────────────────
create type difficulty as enum ('easy', 'medium', 'hard');

create table public.problems (
  id          serial primary key,
  slug        text unique not null,          -- e.g. "lru-cache"
  title       text not null,
  difficulty  difficulty not null,
  tags        text[] not null default '{}',
  description text not null,
  examples    jsonb not null default '[]',   -- [{input, output, explanation}]
  constraints text[] not null default '{}',
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ── matches ─────────────────────────────────────────────────
create type match_status as enum ('waiting', 'active', 'finished', 'cancelled');
create type match_outcome as enum ('player1_win', 'player2_win', 'draw', 'forfeit');

create table public.matches (
  id              uuid primary key default gen_random_uuid(),
  player1_id      uuid not null references public.profiles(id),
  player2_id      uuid references public.profiles(id),       -- null until matched
  problem_id      int references public.problems(id),
  difficulty      difficulty not null default 'medium',
  status          match_status not null default 'waiting',
  outcome         match_outcome,
  winner_id       uuid references public.profiles(id),

  -- Elo snapshots at time of match
  player1_elo_before  int,
  player2_elo_before  int,
  player1_elo_after   int,
  player2_elo_after   int,
  elo_delta           int,                                   -- absolute change (e.g. 21)

  -- Timing
  started_at      timestamptz,
  finished_at     timestamptz,
  player1_solve_time_ms  bigint,                             -- null = did not finish
  player2_solve_time_ms  bigint,

  created_at      timestamptz not null default now()
);

create index on public.matches(player1_id);
create index on public.matches(player2_id);
create index on public.matches(status);

-- ── queue ────────────────────────────────────────────────────
-- Ephemeral matchmaking entries. Cleaned up by the server.
create table public.queue (
  id          uuid primary key default gen_random_uuid(),
  player_id   uuid unique not null references public.profiles(id) on delete cascade,
  elo         int not null,
  difficulty  difficulty not null default 'medium',
  joined_at   timestamptz not null default now()
);

-- ── Row Level Security ───────────────────────────────────────
alter table public.profiles  enable row level security;
alter table public.matches   enable row level security;
alter table public.queue     enable row level security;
alter table public.problems  enable row level security;

-- profiles: anyone can read, only owner can update their own row
create policy "profiles_public_read"  on public.profiles for select using (true);
create policy "profiles_owner_update" on public.profiles for update using (auth.uid() = id);

-- matches: players in the match can read it; server (service role) handles writes
create policy "matches_participant_read" on public.matches for select
  using (auth.uid() = player1_id or auth.uid() = player2_id);

-- problems: public read
create policy "problems_public_read" on public.problems for select using (true);

-- queue: players can see their own entry only
create policy "queue_owner" on public.queue for all using (auth.uid() = player_id);
