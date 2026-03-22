/**
 * Socket.IO server — handles real-time matchmaking and in-battle events.
 *
 * Event flow:
 *   client emits  "queue:join"      → server puts player in queue
 *   server emits  "match:found"     → both players get matchId + opponent info
 *   client emits  "match:ready"     → player confirms ready
 *   server emits  "match:start"     → both players start the clock
 *   client emits  "match:progress"  → optional: update test pass count (shows opponent bar)
 *   server emits  "opponent:progress"
 *   client emits  "anticheat:event" → tab blur, face lost, etc.
 *   server emits  "anticheat:warn"  → echoed back with warning count
 */

import { Server } from "socket.io";
import { enqueue, dequeue, matchEvents } from "./services/matchmaking.js";
import { supabase } from "./db/supabase.js";

/** userId → socketId (for routing opponent events) */
const userSockets = new Map();

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL, credentials: true },
  });

  // ── Auth middleware ──────────────────────────────────────────────────────
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return next(new Error("Invalid token"));

    socket.userId = data.user.id;
    next();
  });

  // ── Match pair event (fires when matchmaking pairs two players) ──────────
  matchEvents.on("matched", async ({ matchId, playerA, playerB }) => {
    // Pick a random problem for this match's difficulty
    const { data: problems } = await supabase
      .from("problems")
      .select("id")
      .eq("difficulty", playerA.difficulty)
      .eq("active", true);

    const problemId = problems && problems.length > 0
      ? problems[Math.floor(Math.random() * problems.length)].id
      : null;

    // Create match record in DB
    await supabase.from("matches").insert({
      id: matchId,
      player_a_id: playerA.userId,
      player_b_id: playerB.userId,
      difficulty: playerA.difficulty,
      problem_id: problemId,
      status: "pending",
    });

    const sockA = userSockets.get(playerA.userId);
    const sockB = userSockets.get(playerB.userId);

    const payload = (myInfo, oppInfo) => ({
      matchId,
      problemId,
      difficulty: myInfo.difficulty,
      you: { userId: myInfo.userId, rating: myInfo.rating },
      opponent: { userId: oppInfo.userId, rating: oppInfo.rating },
    });

    if (sockA) io.to(sockA).emit("match:found", payload(playerA, playerB));
    if (sockB) io.to(sockB).emit("match:found", payload(playerB, playerA));
  });

  // ── Connection ───────────────────────────────────────────────────────────
  io.on("connection", (socket) => {
    userSockets.set(socket.userId, socket.id);

    // ── Queue ──────────────────────────────────────────────────────────────
    socket.on("queue:join", async ({ difficulty = "medium" } = {}) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("elo")
        .eq("id", socket.userId)
        .single();

      if (!profile) return socket.emit("error", "Profile not found");

      enqueue({
        userId: socket.userId,
        rating: profile.elo,
        difficulty,
        socketId: socket.id,
      });

      socket.emit("queue:joined", { difficulty, rating: profile.elo });
    });

    socket.on("queue:leave", () => {
      dequeue(socket.userId);
      socket.emit("queue:left");
    });

    // ── Ready handshake ────────────────────────────────────────────────────
    socket.on("match:ready", async ({ matchId }) => {
      socket.join(`match:${matchId}`);
      // When both players have joined the room (size = 2), start the match
      const room = io.sockets.adapter.rooms.get(`match:${matchId}`);
      if (room?.size === 2) {
        io.to(`match:${matchId}`).emit("match:start", {
          matchId,
          startTime: Date.now(),
          durationSeconds: 30 * 60,
        });
        // Update match status
        await supabase.from("matches").update({ status: "active", started_at: new Date().toISOString() })
          .eq("id", matchId);
      }
    });

    // ── Opponent progress (relay test pass count) ──────────────────────────
    socket.on("match:progress", ({ matchId, testsPassed, testsTotal }) => {
      socket.to(`match:${matchId}`).emit("opponent:progress", { testsPassed, testsTotal });
    });

    // ── Anti-cheat events ──────────────────────────────────────────────────
    const warnCounts = new Map(); // matchId → count

    socket.on("anticheat:event", async ({ matchId, type, details }) => {
      // Log to DB
      await supabase.from("anticheat_events").insert({
        match_id: matchId,
        user_id: socket.userId,
        type,      // "tab_blur" | "face_lost" | "paste_detected"
        details,
        created_at: new Date().toISOString(),
      });

      const key = `${matchId}:${socket.userId}`;
      const count = (warnCounts.get(key) ?? 0) + 1;
      warnCounts.set(key, count);

      socket.emit("anticheat:warn", { type, count, maxWarnings: 3 });

      if (count >= 3) {
        // Auto-forfeit
        socket.emit("match:forfeit", { reason: "anticheat", detail: "Too many violations" });
        io.to(`match:${matchId}`).emit("match:opponent_forfeit", {
          forfeitedUserId: socket.userId,
        });
        await supabase.from("matches").update({
          status: "forfeited",
          forfeited_by: socket.userId,
          completed_at: new Date().toISOString(),
        }).eq("id", matchId);
      }
    });

    // ── Disconnect ─────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      userSockets.delete(socket.userId);
      dequeue(socket.userId);
    });
  });

  return io;
}
