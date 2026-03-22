import { Router } from "express";
import { supabase } from "../db/supabase.js";
import { requireAuth } from "../middleware/auth.js";
import { runTests } from "../services/judge0.js";

const router = Router();

/**
 * POST /execute/run
 * Run code against sample (visible) test cases only.
 * Used for the "Run tests" button during a match.
 *
 * Body: { matchId, problemId, code, language }
 */
router.post("/run", requireAuth, async (req, res) => {
  const { matchId, problemId, code, language } = req.body;

  if (!matchId || !problemId || !code || !language) {
    return res.status(400).json({ error: "matchId, problemId, code, and language are required" });
  }

  // Verify user is a participant
  const { data: match } = await supabase
    .from("matches")
    .select("player_a_id, player_b_id, status")
    .eq("id", matchId)
    .single();

  if (!match) return res.status(404).json({ error: "Match not found" });
  if (match.player_a_id !== req.user.id && match.player_b_id !== req.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }
  if (match.status !== "active") {
    return res.status(409).json({ error: "Match is not active" });
  }

  // Fetch problem + sample test cases
  const { data: problem } = await supabase
    .from("problems")
    .select("function_name, time_limit_seconds")
    .eq("id", problemId)
    .single();

  if (!problem) return res.status(404).json({ error: "Problem not found" });

  const { data: testCases } = await supabase
    .from("test_cases")
    .select("input, expected")
    .eq("problem_id", problemId)
    .eq("is_sample", true)
    .order("sort_order", { ascending: true });

  if (!testCases || testCases.length === 0) {
    return res.status(404).json({ error: "No sample test cases found" });
  }

  try {
    const result = await runTests(code, language, problem.function_name, testCases, problem.time_limit_seconds);
    res.json(result);
  } catch (err) {
    console.error("Code execution error:", err);
    res.status(500).json({ error: "Code execution failed: " + err.message });
  }
});

/**
 * POST /execute/submit
 * Run code against ALL test cases (sample + hidden).
 * Used internally — the main submit flow goes through POST /matches/:id/submit.
 *
 * Body: { matchId, problemId, code, language }
 */
router.post("/submit", requireAuth, async (req, res) => {
  const { matchId, problemId, code, language } = req.body;

  if (!matchId || !problemId || !code || !language) {
    return res.status(400).json({ error: "matchId, problemId, code, and language are required" });
  }

  // Verify user is a participant
  const { data: match } = await supabase
    .from("matches")
    .select("player_a_id, player_b_id, status")
    .eq("id", matchId)
    .single();

  if (!match) return res.status(404).json({ error: "Match not found" });
  if (match.player_a_id !== req.user.id && match.player_b_id !== req.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }
  if (match.status !== "active") {
    return res.status(409).json({ error: "Match is not active" });
  }

  // Fetch problem + ALL test cases
  const { data: problem } = await supabase
    .from("problems")
    .select("function_name, time_limit_seconds")
    .eq("id", problemId)
    .single();

  if (!problem) return res.status(404).json({ error: "Problem not found" });

  const { data: testCases } = await supabase
    .from("test_cases")
    .select("input, expected")
    .eq("problem_id", problemId)
    .order("sort_order", { ascending: true });

  if (!testCases || testCases.length === 0) {
    return res.status(404).json({ error: "No test cases found" });
  }

  try {
    const result = await runTests(code, language, problem.function_name, testCases, problem.time_limit_seconds);
    res.json(result);
  } catch (err) {
    console.error("Code execution error:", err);
    res.status(500).json({ error: "Code execution failed: " + err.message });
  }
});

export default router;
