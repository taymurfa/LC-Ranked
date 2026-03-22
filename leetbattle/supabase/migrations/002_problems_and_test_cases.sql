-- ─────────────────────────────────────────────────────────────────────────────
-- LeetBattle — migration 002: test cases, problem enhancements, match scoring
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Enhance problems table ───────────────────────────────────────────────────
ALTER TABLE problems ADD COLUMN IF NOT EXISTS starter_code jsonb NOT NULL DEFAULT '{}';
ALTER TABLE problems ADD COLUMN IF NOT EXISTS function_name text NOT NULL DEFAULT '';
ALTER TABLE problems ADD COLUMN IF NOT EXISTS time_limit_seconds numeric NOT NULL DEFAULT 5;

-- ── test_cases ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS test_cases (
  id          serial PRIMARY KEY,
  problem_id  integer NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  input       jsonb NOT NULL,
  expected    jsonb NOT NULL,
  is_sample   boolean NOT NULL DEFAULT false,
  input_size  integer NOT NULL DEFAULT 0,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS test_cases_problem_idx ON test_cases(problem_id);

ALTER TABLE test_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "test_cases_public_read" ON test_cases FOR SELECT USING (true);

-- ── Enhance matches table ────────────────────────────────────────────────────
ALTER TABLE matches ADD COLUMN IF NOT EXISTS problem_id integer REFERENCES problems(id);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS player_a_score integer;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS player_b_score integer;
