/**
 * Point-based scoring for LeetBattle matches.
 *
 * Score breakdown (max 1000):
 *   Test cases:       600 pts  — (passed / total) × 600
 *   Speed bonus:      200 pts  — faster coding time = more points
 *   Efficiency bonus: 200 pts  — faster execution = more points (proxy for time complexity)
 */

const MAX_TEST_SCORE = 600;
const MAX_SPEED_BONUS = 200;
const MAX_EFFICIENCY_BONUS = 200;

/**
 * Calculate a player's match score.
 *
 * @param {object} params
 * @param {number} params.testsPassed
 * @param {number} params.testsTotal
 * @param {number} params.codingTimeSeconds   — seconds from match start to submit
 * @param {number} params.matchDurationSeconds — total match duration (e.g. 1800)
 * @param {number} params.avgExecTimeSeconds   — average Judge0 execution time per test case
 * @param {number} params.timeLimitSeconds     — per-test-case time limit from problem
 * @returns {{ testScore: number, speedBonus: number, efficiencyBonus: number, totalScore: number }}
 */
export function calculateScore({
  testsPassed,
  testsTotal,
  codingTimeSeconds,
  matchDurationSeconds,
  avgExecTimeSeconds,
  timeLimitSeconds,
}) {
  // Test cases: proportional to how many passed
  const testScore = testsTotal > 0
    ? Math.round((testsPassed / testsTotal) * MAX_TEST_SCORE)
    : 0;

  // Speed bonus: linear decay from max to 0 over match duration
  // If you submit instantly you get 200, at the deadline you get 0
  const speedRatio = Math.max(0, 1 - codingTimeSeconds / matchDurationSeconds);
  const speedBonus = Math.round(speedRatio * MAX_SPEED_BONUS);

  // Efficiency bonus: lower execution time = more points
  // 0 exec time → 200 pts, at time limit → 0 pts
  const efficiencyRatio = Math.max(0, 1 - avgExecTimeSeconds / timeLimitSeconds);
  const efficiencyBonus = Math.round(efficiencyRatio * MAX_EFFICIENCY_BONUS);

  return {
    testScore,
    speedBonus,
    efficiencyBonus,
    totalScore: testScore + speedBonus + efficiencyBonus,
  };
}
