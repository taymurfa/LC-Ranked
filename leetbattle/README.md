# LeetBattle — Backend

Express + Supabase backend for ranked 1v1 coding duels.

## Stack
- **Runtime**: Node.js (ESM)
- **Framework**: Express 4
- **Database / Auth**: Supabase (Postgres + built-in auth)
- **Real-time**: Socket.IO 4
- **Validation**: Zod

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create your Supabase project
Go to [supabase.com](https://supabase.com), create a project, then copy your keys.

### 3. Configure environment
```bash
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET
```

### 4. Run the database migration
Paste `supabase/migrations/001_initial_schema.sql` into the **Supabase SQL Editor** and run it.
Or use the Supabase CLI:
```bash
supabase db push
```

### 5. Start the server
```bash
npm run dev      # nodemon (hot reload)
npm start        # production
```

---

## API Reference

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Create account (`email`, `password`, `username`) |
| POST | `/api/auth/signin` | Sign in → returns `accessToken` + `refreshToken` |
| POST | `/api/auth/refresh` | Exchange refresh token for new session |
| POST | `/api/auth/signout` | Invalidate session (auth required) |

### Profiles
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/profiles/me` | ✓ | Own profile + rank |
| GET | `/api/profiles/:username` | — | Public profile |
| GET | `/api/profiles/:username/matches` | — | Paginated match history |

### Matches
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/matches/:id` | ✓ | Match detail (participants only) |
| POST | `/api/matches/:id/submit` | ✓ | Submit solution; settles Elo when both submit |

### Leaderboard
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/leaderboard` | Top players by Elo (`?limit=50&offset=0`) |

### Status
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/status` | Health check + live queue size |

---

## Socket.IO Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `queue:join` | `{ difficulty }` | Join matchmaking queue |
| `queue:leave` | — | Leave queue |
| `match:ready` | `{ matchId }` | Confirm ready; join match room |
| `match:progress` | `{ matchId, testsPassed, testsTotal }` | Broadcast test progress to opponent |
| `anticheat:event` | `{ matchId, type, details }` | Report a cheat event (tab_blur, face_lost, paste_detected) |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `queue:joined` | `{ difficulty, rating }` | Queued successfully |
| `queue:left` | — | Dequeued |
| `match:found` | `{ matchId, you, opponent, difficulty }` | Opponent found |
| `match:start` | `{ matchId, startTime, durationSeconds }` | Both ready — start the clock |
| `opponent:progress` | `{ testsPassed, testsTotal }` | Opponent's test progress |
| `anticheat:warn` | `{ type, count, maxWarnings }` | Warning issued |
| `match:forfeit` | `{ reason, detail }` | You forfeited (3 violations) |
| `match:opponent_forfeit` | `{ forfeitedUserId }` | Opponent forfeited |

---

## Elo System

| Difficulty | K-factor | Provisional (first 10 matches) |
|------------|----------|-------------------------------|
| Easy | 16 | 32 |
| Medium | 24 | 48 |
| Hard | 32 | 64 |

**Winner determination**: both solved → faster time wins · one solved → solver wins · neither → draw.

**Rank tiers**: Bronze I → Bronze II → Silver I → Silver II → Gold I → Gold II → Platinum → Diamond → Master → Grandmaster

---

## Project Structure
```
src/
  index.js              # Express app + HTTP server entrypoint
  socket.js             # Socket.IO server (matchmaking + battle events)
  db/
    supabase.js         # Supabase service-role client
  middleware/
    auth.js             # requireAuth middleware + socket token verifier
  routes/
    auth.js             # /api/auth/*
    profiles.js         # /api/profiles/*
    matches.js          # /api/matches/*
    leaderboard.js      # /api/leaderboard
  services/
    elo.js              # calculateElo, getRankTier, matchmakingWindow
    matchmaking.js      # In-memory queue + pairing logic
supabase/
  migrations/
    001_initial_schema.sql
```

> **Production note**: Replace the in-memory matchmaking queue in `services/matchmaking.js`
> with a Redis sorted-set (e.g. `ioredis` + ZADD/ZRANGEBYSCORE) before deploying multiple
> server instances — the current queue is single-process only.
