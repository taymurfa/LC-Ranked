/**
 * Elo rating service for 1v1 LeetBattle matches.
 *
 * K-factor by difficulty:
 *   easy   → 16
 *   medium → 24
 *   hard   → 32
 *
 * Provisional period: first 10 matches use K × 2 so new
 * players settle into their true bracket faster.
 */

const K_FACTOR = { easy: 16, medium: 24, hard: 32 };
const PROVISIONAL_MATCHES = 10;
const PROVISIONAL_MULTIPLIER = 2;
const RATING_FLOOR = 100;

/**
 * Expected win probability for player A against player B.
 * @param {number} ratingA
 * @param {number} ratingB
 * @returns {number} 0–1
 */
export function expectedScore(ratingA, ratingB) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Calculate new ratings after a match.
 *
 * @param {{rating: number, matchCount: number}} playerA
 * @param {{rating: number, matchCount: number}} playerB
 * @param {"win"|"loss"|"draw"} outcomeForA  — result from A's perspective
 * @param {"easy"|"medium"|"hard"} difficulty
 * @returns {{ newRatingA: number, newRatingB: number, deltaA: number, deltaB: number }}
 */
export function calculateElo(playerA, playerB, outcomeForA, difficulty = "medium") {
  const baseK = K_FACTOR[difficulty] ?? K_FACTOR.medium;

  const kA = playerA.matchCount < PROVISIONAL_MATCHES ? baseK * PROVISIONAL_MULTIPLIER : baseK;
  const kB = playerB.matchCount < PROVISIONAL_MATCHES ? baseK * PROVISIONAL_MULTIPLIER : baseK;

  const eA = expectedScore(playerA.rating, playerB.rating);
  const eB = 1 - eA;

  const scoreMap = { win: 1, draw: 0.5, loss: 0 };
  const sA = scoreMap[outcomeForA];
  const sB = 1 - sA;

  const deltaA = Math.round(kA * (sA - eA));
  const deltaB = Math.round(kB * (sB - eB));

  return {
    newRatingA: Math.max(RATING_FLOOR, playerA.rating + deltaA),
    newRatingB: Math.max(RATING_FLOOR, playerB.rating + deltaB),
    deltaA,
    deltaB,
  };
}

/**
 * Map an Elo rating to a rank tier label.
 * @param {number} rating
 * @returns {string}
 */
export function getRankTier(rating) {
  if (rating >= 2100) return "Grandmaster";
  if (rating >= 1900) return "Master";
  if (rating >= 1700) return "Diamond";
  if (rating >= 1500) return "Platinum";
  if (rating >= 1350) return "Gold II";
  if (rating >= 1200) return "Gold I";
  if (rating >= 1100) return "Silver II";
  if (rating >= 1000) return "Silver I";
  if (rating >= 800)  return "Bronze II";
  return "Bronze I";
}

/**
 * Return the Elo window used for matchmaking at a given rating.
 * Window expands every 30 s of queue time.
 * @param {number} rating
 * @param {number} waitSeconds
 * @returns {{ min: number, max: number }}
 */
export function matchmakingWindow(rating, waitSeconds = 0) {
  const base = 100;
  const expansion = Math.floor(waitSeconds / 30) * 50;
  const window = base + expansion;
  return { min: rating - window, max: rating + window };
}
