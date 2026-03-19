import { Router } from "express";
import { supabase } from "../db/supabase.js";
import { requireAuth } from "../middleware/auth.js";
import { getRankTier } from "../services/elo.js";

const router = Router();

/**
 * GET /profiles/me
 * Authenticated user's own profile.
 */
router.get("/me", requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", req.user.id)
    .single();

  if (error) return res.status(404).json({ error: "Profile not found" });

  res.json({ ...data, rank: getRankTier(data.elo) });
});

/**
 * GET /profiles/me/matches
 * Authenticated user's own match history.
 */
router.get("/me/matches", requireAuth, async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const offset = (page - 1) * limit;
  const userId = req.user.id;

  const { data, error, count } = await supabase
    .from("matches")
    .select(`
      id, difficulty, created_at,
      player_a_id, player_b_id,
      player_a_delta, player_b_delta,
      winner_id,
      player_a:profiles!player_a_id(username, elo),
      player_b:profiles!player_b_id(username, elo)
    `, { count: "exact" })
    .or(`player_a_id.eq.${userId},player_b_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return res.status(500).json({ error: error.message });

  res.json({
    matches: data,
    pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
  });
});

/**
 * GET /profiles/:username
 * Public profile lookup.
 */
router.get("/:username", async (req, res) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, elo, wins, losses, match_count, created_at")
    .eq("username", req.params.username)
    .single();

  if (error) return res.status(404).json({ error: "User not found" });

  res.json({ ...data, rank: getRankTier(data.elo) });
});

/**
 * GET /profiles/:username/matches
 * Paginated match history for a user.
 * Query params: page (default 1), limit (default 20)
 */
router.get("/:username/matches", async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const offset = (page - 1) * limit;

  // Resolve username → id first
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", req.params.username)
    .single();

  if (!profile) return res.status(404).json({ error: "User not found" });

  const { data, error, count } = await supabase
    .from("matches")
    .select(`
      id, difficulty, created_at,
      player_a_id, player_b_id,
      player_a_delta, player_b_delta,
      winner_id,
      player_a:profiles!player_a_id(username, elo),
      player_b:profiles!player_b_id(username, elo)
    `, { count: "exact" })
    .or(`player_a_id.eq.${profile.id},player_b_id.eq.${profile.id}`)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return res.status(500).json({ error: error.message });

  res.json({
    matches: data,
    pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
  });
});

export default router;
