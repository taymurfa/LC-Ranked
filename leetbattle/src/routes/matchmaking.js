import { Router } from "express";
import { supabase } from "../db/supabase.js";
import { requireAuth } from "../middleware/auth.js";
import { enqueue, dequeue, queueSize } from "../services/matchmaking.js";

const router = Router();

/**
 * POST /matchmaking/join
 * Body: { difficulty: 'easy' | 'medium' | 'hard' }
 *
 * Adds the player to the in-memory matchmaking queue via their socket connection.
 * Actual pairing happens asynchronously via the matchEvents emitter in socket.js.
 */
router.post("/join", requireAuth, async (req, res) => {
  const { difficulty = "medium" } = req.body;
  const playerId = req.user.id;

  // Fetch current Elo
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("elo, match_count")
    .eq("id", playerId)
    .single();

  if (profileErr || !profile) {
    return res.status(404).json({ error: "Profile not found" });
  }

  enqueue({
    userId: playerId,
    rating: profile.elo,
    difficulty,
    socketId: null, // REST-initiated; socket handler fills this in
  });

  res.status(202).json({
    status: "queued",
    message: "In queue — you will be notified via socket when a match is found",
    difficulty,
    elo: profile.elo,
  });
});

/**
 * GET /matchmaking/status
 * Returns current queue info.
 */
router.get("/status", requireAuth, async (req, res) => {
  res.json({
    status: "ok",
    queueSize: queueSize(),
  });
});

/**
 * DELETE /matchmaking/cancel
 * Remove the player from the queue.
 */
router.delete("/cancel", requireAuth, async (req, res) => {
  dequeue(req.user.id);
  res.json({ status: "cancelled" });
});

export default router;
