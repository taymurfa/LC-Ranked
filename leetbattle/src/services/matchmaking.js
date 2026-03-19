/**
 * In-memory matchmaking queue with Elo-based pairing.
 *
 * In production, replace the in-memory queue with a Redis sorted-set
 * (ZADD by rating, ZRANGEBYSCORE for window lookup) so multiple
 * server instances share queue state.
 */

import { EventEmitter } from "events";
import { matchmakingWindow } from "./elo.js";

export const matchEvents = new EventEmitter();

/** @type {Map<string, QueueEntry>} userId → entry */
const queue = new Map();

/**
 * @typedef {{ userId: string, rating: number, difficulty: string, joinedAt: number, socketId: string }} QueueEntry
 */

/**
 * Add a player to the matchmaking queue and attempt pairing.
 * Emits "matched" with { matchId, playerA, playerB } when a pair is found.
 *
 * @param {QueueEntry} entry
 */
export function enqueue(entry) {
  if (queue.has(entry.userId)) return; // already queued
  queue.set(entry.userId, { ...entry, joinedAt: Date.now() });
  tryMatch(entry.userId);
}

/**
 * Remove a player from the queue (cancelled or disconnected).
 * @param {string} userId
 */
export function dequeue(userId) {
  queue.delete(userId);
}

/**
 * Try to find a match for the newly queued player.
 * @param {string} seekerId
 */
function tryMatch(seekerId) {
  const seeker = queue.get(seekerId);
  if (!seeker) return;

  const waitSecs = (Date.now() - seeker.joinedAt) / 1000;
  const { min, max } = matchmakingWindow(seeker.rating, waitSecs);

  for (const [candidateId, candidate] of queue) {
    if (candidateId === seekerId) continue;
    if (candidate.difficulty !== seeker.difficulty) continue;
    if (candidate.rating < min || candidate.rating > max) continue;

    // Pair found — remove both and emit
    queue.delete(seekerId);
    queue.delete(candidateId);

    const matchId = `match_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    matchEvents.emit("matched", { matchId, playerA: seeker, playerB: candidate });
    return;
  }

  // No match yet — retry after 5 s with an expanded window
  setTimeout(() => tryMatch(seekerId), 5000);
}

/** Return current queue depth (for /status endpoint). */
export function queueSize() {
  return queue.size;
}
