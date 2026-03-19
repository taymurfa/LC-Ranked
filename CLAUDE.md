# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LC-Ranked (LeetBattle) is a ranked 1v1 competitive coding platform — "LeetCode but ranked." Players queue for real-time matches, solve the same problem head-to-head, and gain/lose Elo rating.

## Architecture

**Monorepo with two apps:**
- `client/` — React 19 + Vite frontend (SPA)
- `leetbattle/` — Express + Socket.IO backend with Supabase (Postgres + Auth)

**Real-time flow:** Matchmaking and in-battle events use Socket.IO. REST API handles auth, profiles, match submission, and leaderboard.

**Key backend services:**
- `src/services/matchmaking.js` — In-memory queue with Elo-window pairing (event-driven via EventEmitter)
- `src/services/elo.js` — Elo calculation with K-factor by difficulty, provisional period
- `src/socket.js` — Socket.IO server: queue management, ready handshake, anti-cheat event logging, opponent progress relay
- `src/middleware/auth.js` — Supabase JWT validation for REST + socket

**Database:** Supabase (Postgres). Single migration in `leetbattle/supabase/migrations/001_initial_schema.sql`. Tables: `profiles`, `matches`, `problems`, `anticheat_events`.

## Development Commands

```bash
# Backend
cd leetbattle
npm install
npm run dev          # nodemon + hot reload on :3001

# Frontend
cd client
npm install
npm run dev          # Vite dev server on :5173 (proxies /api + /socket.io to :3001)
npm run build        # Production build
npm run lint         # ESLint
```

## Environment Variables

**Backend (`leetbattle/.env`):**
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — Supabase project credentials
- `JWT_SECRET` — for socket auth token verification
- `CLIENT_URL` — CORS origin (default `http://localhost:5173`)
- `PORT` — server port (default `3001`)

**Frontend (`client/.env`):**
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — Supabase public client credentials

## Socket Event Flow

```
queue:join → enqueue → matched → match:found → match:ready → match:start
match:progress → opponent:progress
anticheat:event → anticheat:warn (auto-forfeit at 3 violations)
```

## Column Naming Convention

Matches use `player_a_id` / `player_b_id` (not player1/player2). Profile stats column is `match_count` (not matches_played). Match statuses: `pending`, `active`, `completed`, `forfeited`, `expired`.
