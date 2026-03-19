import { Router } from "express";
import { supabase } from "../db/supabase.js";
import { requireAuth } from "../middleware/auth.js";
import { joinQueue, leaveQueue, findOpponent, createMatch } from "../services/matchmaking.js";

const router = Router();

/**
 * POST /matchmaking/join
 * Body: { difficulty: 'easy' | 'medium' | 'hard' }
 *
 * Adds the player to the queue and immediately attempts to find a match.
 * If a match is found, returns the match. Otherwise returns queue status.
 */
router.post("/join", requireAuth, async (req, res) => {
  const { difficulty = "medium" } = req.body;
  const playerId = req.user.id;

  // Fetch current Elo
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("elo, matches_played")
    .eq("id", playerId)
    .single();

  if (profileErr || !profile) {
    return res.status(404).json({ error: "Profile not found" });
  }

  // Don't let a player queue twice
  const { data: existing } = await supabase
    .from("queue")
    .select("id")
    .eq("player_id", playerId)
    .maybeSingle();

  if (existing) {
    return res.status(409).json({ error: "Already in queue" });
  }

  await joinQueue(playerId, profile.elo, difficulty);

  // Immediate match attempt (0 wait time → tight Elo range)
  const opponent = await findOpponent(playerId, profile.elo, difficulty, 0);

  if (opponent) {
    // Fetch opponent profile for Elo
    const { data: oppProfile } = await supabase
      .from("profiles")
      .select("elo, matches_played")
      .eq("id", opponent.player_id)
      .single();

    const match = await createMatch(
      playerId,
      opponent.player_id,
      null,
      difficulty,
      profile.elo,
      oppProfile.elo
    );

    return res.status(201).json({ status: "matched", match });
  }

  res.status(202).json({
    status: "queued",
    message: "In queue — poll /matchmaking/status to check for a match",
    difficulty,
    elo: profile.elo,
  });
});

/**
 * GET /matchmaking/status
 *
 * Poll this every 2–3 seconds after joining the queue.
 * Expands the Elo search window based on wait time.
 */
router.get("/status", requireAuth, async (req, res) => {
  const playerId = req.user.id;

  const { data: entry } = await supabase
    .from("queue")
    .select("*")
    .eq("player_id", playerId)
    .maybeSingle();

  if (!entry) {
    // Not in queue — check if they were just matched
    const { data: activeMatch } = await supabase
      .from("matches")
      .select("*")
      .or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (activeMatch) {
      return res.json({ status: "matched", match: activeMatch });
    }
    return res.json({ status: "not_queued" });
  }

  const waitSeconds = Math.floor((Date.now() - new Date(entry.joined_at).getTime()) / 1000);

  // Fetch my Elo again (might have changed)
  const { data: profile } = await supabase
    .from("profiles")
    .select("elo")
    .eq("id", playerId)
    .single();

  const opponent = await findOpponent(playerId, profile.elo, entry.difficulty, waitSeconds);

  if (opponent) {
    const { data: oppProfile } = await supabase
      .from("profiles")
      .select("elo")
      .eq("id", opponent.player_id)
      .single();

    const match = await createMatch(
      playerId,
      opponent.player_id,
      null,
      entry.difficulty,
      profile.elo,
      oppProfile.elo
    );

    return res.json({ status: "matched", match });
  }

  res.json({
    status: "queued",
    waitSeconds,
    eloRange: `${profile.elo - 50} – ${profile.elo + 50}`,
  });
});

/**
 * DELETE /matchmaking/cancel
 * Remove the player from the queue.
 */
router.delete("/cancel", requireAuth, async (req, res) => {
  await leaveQueue(req.user.id);
  res.json({ status: "cancelled" });
});

export default router;
