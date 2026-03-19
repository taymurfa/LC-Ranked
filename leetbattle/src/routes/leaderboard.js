import { Router } from "express";
import { supabase } from "../db/supabase.js";
import { getRankTier } from "../services/elo.js";

const router = Router();

/**
 * GET /leaderboard
 * Global top players sorted by Elo.
 * Query params: limit (default 50, max 100), offset (default 0)
 */
router.get("/", async (req, res) => {
  const limit = Math.min(100, parseInt(req.query.limit) || 50);
  const offset = parseInt(req.query.offset) || 0;

  const { data, error, count } = await supabase
    .from("profiles")
    .select("id, username, elo, wins, losses, match_count", { count: "exact" })
    .order("elo", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return res.status(500).json({ error: error.message });

  const rows = data.map((p, i) => ({
    ...p,
    rank: offset + i + 1,
    tier: getRankTier(p.elo),
    winRate: p.match_count > 0 ? Math.round((p.wins / p.match_count) * 100) : 0,
  }));

  res.json({ players: rows, total: count });
});

export default router;
