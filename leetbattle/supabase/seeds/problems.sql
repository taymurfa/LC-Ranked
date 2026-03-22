-- LeetBattle seed data — run after migrations
-- Combines easy, medium, and hard problems
-- Run in order: problems_easy.sql, problems_medium.sql, problems_hard.sql

-- Reset sequences to start fresh
ALTER SEQUENCE problems_id_seq RESTART WITH 1;
ALTER SEQUENCE test_cases_id_seq RESTART WITH 1;

\i problems_easy.sql
\i problems_medium.sql
\i problems_hard.sql
