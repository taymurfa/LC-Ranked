import { Router } from "express";
import { z } from "zod";
import { supabase } from "../db/supabase.js";
import { requireAuth } from "../middleware/auth.js";
import { calculateElo } from "../services/elo.js";
import { calculateScore } from "../services/scoring.js";
import { runTests } from "../services/judge0.js";

const router = Router();

const submitSchema = z.object({
  code: z.string().min(1),
  language: z.string(),
});

/**
 * GET /matches/:id
 * Fetch a single match by ID (with player + problem info).
 */
router.get("/:id", requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from("matches")
    .select(`
      *,
      player_a:profiles!player_a_id(id, username, elo),
      player_b:profiles!player_b_id(id, username, elo),
      problem:problems!problem_id(id, title, difficulty)
    `)
    .eq("id", req.params.id)
    .single();

  if (error) return res.status(404).json({ error: "Match not found" });

  const userId = req.user.id;
  if (data.player_a_id !== userId && data.player_b_id !== userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  res.json(data);
});

/**
 * POST /matches/:id/submit
 *
 * Player submits their solution. The server:
 * 1. Runs code against ALL test cases via Judge0
 * 2. Computes a score (test cases + speed bonus + efficiency bonus)
 * 3. When both players have submitted, compares scores and settles Elo
 */
router.post("/:id/submit", requireAuth, async (req, res) => {
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const userId = req.user.id;
  const { code, language } = parsed.data;

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

  // Check if this player already submitted
  const existingSubmission = isPlayerA ? match.player_a_submission : match.player_b_submission;
  if (existingSubmission) return res.status(409).json({ error: "Already submitted" });

  // Load problem and ALL test cases
  const { data: problem } = await supabase
    .from("problems")
    .select("function_name, time_limit_seconds")
    .eq("id", match.problem_id)
    .single();

  if (!problem) return res.status(500).json({ error: "Problem not found for this match" });

  const { data: testCases } = await supabase
    .from("test_cases")
    .select("input, expected")
    .eq("problem_id", match.problem_id)
    .order("sort_order", { ascending: true });

  // Run code against all test cases via Judge0
  let testResult;
  try {
    testResult = await runTests(code, language, problem.function_name, testCases || [], problem.time_limit_seconds);
  } catch (err) {
    console.error("Judge0 execution error:", err);
    // If execution fails entirely, record 0/0 result
    testResult = { passed: 0, total: (testCases || []).length, avgExecTime: problem.time_limit_seconds, results: [] };
  }

  // Compute coding time (seconds since match started)
  const codingTimeSeconds = match.started_at
    ? Math.floor((Date.now() - new Date(match.started_at).getTime()) / 1000)
    : 1800;

  const matchDurationSeconds = 30 * 60; // 30 min

  // Calculate score
  const score = calculateScore({
    testsPassed: testResult.passed,
    testsTotal: testResult.total,
    codingTimeSeconds,
    matchDurationSeconds,
    avgExecTimeSeconds: testResult.avgExecTime,
    timeLimitSeconds: problem.time_limit_seconds,
  });

  const submissionCol = isPlayerA ? "player_a_submission" : "player_b_submission";
  const scoreCol = isPlayerA ? "player_a_score" : "player_b_score";

  // Save submission + score
  await supabase.from("matches").update({
    [submissionCol]: {
      code,
      language,
      testsPassed: testResult.passed,
      testsTotal: testResult.total,
      avgExecTime: testResult.avgExecTime,
      codingTimeSeconds,
      score,
      submittedAt: new Date().toISOString(),
    },
    [scoreCol]: score.totalScore,
  }).eq("id", match.id);

  // Notify opponent via socket
  const io = req.app.get("io");
  if (io) {
    io.to(`match:${match.id}`).emit("opponent:submitted", { userId });
  }

  // Re-read match to check if opponent already submitted
  const { data: updatedMatch } = await supabase
    .from("matches")
    .select("player_a_submission, player_b_submission, player_a_score, player_b_score, player_a_id, player_b_id, difficulty")
    .eq("id", match.id)
    .single();

  const opponentSubmission = isPlayerA ? updatedMatch.player_b_submission : updatedMatch.player_a_submission;
  const bothSubmitted = !!opponentSubmission;

  if (!bothSubmitted) {
    return res.json({
      status: "waiting",
      message: "Waiting for opponent",
      score,
      testResult: { passed: testResult.passed, total: testResult.total, results: testResult.results },
    });
  }

  // Both submitted — determine winner by score
  const scoreA = updatedMatch.player_a_score;
  const scoreB = updatedMatch.player_b_score;

  let winnerId = null;
  if (scoreA > scoreB) winnerId = updatedMatch.player_a_id;
  else if (scoreB > scoreA) winnerId = updatedMatch.player_b_id;
  // else draw (null)

  const outcomeForA = winnerId === updatedMatch.player_a_id ? "win" : winnerId === null ? "draw" : "loss";

  // Load current ratings
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, elo, match_count, wins, losses")
    .in("id", [updatedMatch.player_a_id, updatedMatch.player_b_id]);

  const profileA = profiles?.find(p => p.id === updatedMatch.player_a_id);
  const profileB = profiles?.find(p => p.id === updatedMatch.player_b_id);

  if (!profileA || !profileB) {
    return res.status(500).json({ error: "Could not load player profiles for Elo calculation" });
  }

  const { newRatingA, newRatingB, deltaA, deltaB } = calculateElo(
    { rating: profileA.elo, matchCount: profileA.match_count },
    { rating: profileB.elo, matchCount: profileB.match_count },
    outcomeForA,
    updatedMatch.difficulty
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
  }).eq("id", updatedMatch.player_a_id);

  await supabase.from("profiles").update({
    elo: newRatingB,
    match_count: profileB.match_count + 1,
    wins: profileB.wins + (outcomeForA === "loss" ? 1 : 0),
    losses: profileB.losses + (outcomeForA === "win" ? 1 : 0),
  }).eq("id", updatedMatch.player_b_id);

  // Notify both players via socket
  if (io) {
    io.to(`match:${match.id}`).emit("match:completed", {
      matchId: match.id,
      winnerId,
      scoreA,
      scoreB,
      deltaA,
      deltaB,
    });
  }

  const myDelta = isPlayerA ? deltaA : deltaB;
  const myNewRating = isPlayerA ? newRatingA : newRatingB;

  res.json({
    status: "completed",
    winnerId,
    score,
    testResult: { passed: testResult.passed, total: testResult.total, results: testResult.results },
    myDelta,
    myNewRating,
    isWinner: winnerId === userId,
  });
});

export default router;
