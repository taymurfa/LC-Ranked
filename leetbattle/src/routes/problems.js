import { Router } from "express";
import { supabase } from "../db/supabase.js";

const router = Router();

/**
 * GET /problems/:id
 * Returns a problem with its sample test cases (hidden test cases are not exposed).
 */
router.get("/:id", async (req, res) => {
  const problemId = parseInt(req.params.id);
  if (isNaN(problemId)) return res.status(400).json({ error: "Invalid problem ID" });

  const { data: problem, error } = await supabase
    .from("problems")
    .select("id, slug, title, difficulty, tags, description, examples, constraints, starter_code, function_name, time_limit_seconds")
    .eq("id", problemId)
    .eq("active", true)
    .single();

  if (error || !problem) return res.status(404).json({ error: "Problem not found" });

  // Only return sample test cases (visible to players)
  const { data: sampleTests } = await supabase
    .from("test_cases")
    .select("id, input, expected, sort_order")
    .eq("problem_id", problemId)
    .eq("is_sample", true)
    .order("sort_order", { ascending: true });

  res.json({ ...problem, sampleTests: sampleTests || [] });
});

export default router;
