import { Router } from "express";
import { z } from "zod";
import { supabase } from "../db/supabase.js";
import { requireAuth } from "../middleware/auth.js";
import { calculateElo } from "../services/elo.js";

const router = Router();

const submitSchema = z.object({
  matchId: z.string(),
  code: z.string().min(1),
  language: z.string(),
  testsPassed: z.number().int().min(0),
  testsTotal: z.number().int().min(1),
  durationSeconds: z.number().int().min(0),
});

/**
 * GET /matches/:id
 * Fetch a single match by ID.
 */
router.get("/:id", requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from("matches")
    .select(`
      *,
      player_a:profiles!player_a_id(id, username, elo),
      player_b:profiles!player_b_id(id, username, elo)
    `)
    .eq("id", req.params.id)
    .single();

  if (error) return res.status(404).json({ error: "Match not found" });

  // Only participants can see full match details
  const userId = req.user.id;
  if (data.player_a_id !== userId && data.player_b_id !== userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  res.json(data);
});

/**
 * POST /matches/:id/submit
 * Player submits their solution. When both players have submitted
 * (or time expires), Elo is settled and the match is closed.
 */
router.post("/:id/submit", requireAuth, async (req, res) => {
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const userId = req.user.id;
  const { code, language, testsPassed, testsTotal, durationSeconds } = parsed.data;

  // Load match
  const { data: match, error: matchErr } = await supabase
    .from("matches")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (matchErr || !match) return res.status(404).json({ error: "Match not found" });
  if (match.status === "completed") return res.status(409).json({ error: "Match already completed" });

  const isPlayerA = match.player_a_id === userId;
  const isPlayerB = match.player_b_id === userId;
  if (!isPlayerA && !isPlayerB) return res.status(403).json({ error: "Forbidden" });

  const allPassed = testsPassed === testsTotal;
  const submissionCol = isPlayerA ? "player_a_submission" : "player_b_submission";

  // Save this player's submission
  await supabase.from("matches").update({
    [submissionCol]: { code, language, testsPassed, testsTotal, durationSeconds, allPassed, submittedAt: new Date().toISOString() },
  }).eq("id", match.id);

  // Check if opponent already submitted
  const opponentSubmission = isPlayerA ? match.player_b_submission : match.player_a_submission;
  const bothSubmitted = !!opponentSubmission;

  if (!bothSubmitted) {
    return res.json({ status: "waiting", message: "Waiting for opponent" });
  }

  // Both submitted — settle the match
  const aSubmission = isPlayerA
    ? { allPassed, durationSeconds }
    : opponentSubmission;
  const bSubmission = isPlayerA
    ? opponentSubmission
    : { allPassed, durationSeconds };

  const winnerId = determineWinner(match, aSubmission, bSubmission);
  const outcomeForA = winnerId === match.player_a_id ? "win" : winnerId === null ? "draw" : "loss";

  // Load current ratings
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, elo, match_count")
    .in("id", [match.player_a_id, match.player_b_id]);

  const profileA = profiles.find(p => p.id === match.player_a_id);
  const profileB = profiles.find(p => p.id === match.player_b_id);

  const { newRatingA, newRatingB, deltaA, deltaB } = calculateElo(
    { rating: profileA.elo, matchCount: profileA.match_count },
    { rating: profileB.elo, matchCount: profileB.match_count },
    outcomeForA,
    match.difficulty
  );

  // Update match record
  await supabase.from("matches").update({
    status: "completed",
    winner_id: winnerId,
    player_a_delta: deltaA,
    player_b_delta: deltaB,
    completed_at: new Date().toISOString(),
  }).eq("id", match.id);

  // Update both profiles
  await supabase.from("profiles").update({
    elo: newRatingA,
    match_count: profileA.match_count + 1,
    wins: profileA.wins + (outcomeForA === "win" ? 1 : 0),
    losses: profileA.losses + (outcomeForA === "loss" ? 1 : 0),
  }).eq("id", match.player_a_id);

  await supabase.from("profiles").update({
    elo: newRatingB,
    match_count: profileB.match_count + 1,
    wins: profileB.wins + (outcomeForA === "loss" ? 1 : 0),
    losses: profileB.losses + (outcomeForA === "win" ? 1 : 0),
  }).eq("id", match.player_b_id);

  const myDelta = isPlayerA ? deltaA : deltaB;
  const myNewRating = isPlayerA ? newRatingA : newRatingB;

  res.json({
    status: "completed",
    winnerId,
    myDelta,
    myNewRating,
    isWinner: winnerId === userId,
  });
});

/**
 * Determine winner from both submissions.
 * Priority: both solved → faster wins; one solved → solver wins; neither → draw.
 */
function determineWinner(match, aSubmission, bSubmission) {
  const aWon = aSubmission.allPassed;
  const bWon = bSubmission.allPassed;

  if (aWon && bWon) {
    if (aSubmission.durationSeconds < bSubmission.durationSeconds) return match.player_a_id;
    if (bSubmission.durationSeconds < aSubmission.durationSeconds) return match.player_b_id;
    return null; // exact tie
  }
  if (aWon) return match.player_a_id;
  if (bWon) return match.player_b_id;
  return null; // neither solved
}

export default router;
