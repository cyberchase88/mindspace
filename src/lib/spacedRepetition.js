// SuperMemo SM-2 Spaced Repetition Algorithm implementation

/**
 * Calculates the next interval and difficulty after a review.
 * @param {number} prevInterval - Previous interval in days (1 for new, or last interval)
 * @param {number} prevDifficulty - Previous difficulty factor (default 2.5)
 * @param {number} quality - User rating (0-5, 5 = perfect recall, 0 = complete blackout)
 * @returns {{ nextInterval: number, nextDifficulty: number }}
 */
export function calculateNextReview(prevInterval, prevDifficulty, quality) {
  // SM-2 algorithm constants
  let difficulty = prevDifficulty;
  let interval = 0;

  // If quality < 3, reset interval
  if (quality < 3) {
    interval = 1;
  } else {
    if (prevInterval === 1) {
      interval = 6;
    } else {
      interval = Math.round(prevInterval * difficulty);
    }
  }

  // Update difficulty factor
  difficulty = difficulty + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (difficulty < 1.3) difficulty = 1.3;
  if (difficulty > 2.5) difficulty = 2.5;

  return { nextInterval: interval, nextDifficulty: difficulty };
}

/**
 * Returns the initial interval and difficulty for a new item.
 * @returns {{ nextInterval: number, nextDifficulty: number }}
 */
export function initialReview() {
  return { nextInterval: 1, nextDifficulty: 2.5 };
}

/**
 * Helper to clamp difficulty factor within allowed range.
 * @param {number} difficulty
 * @returns {number}
 */
export function clampDifficulty(difficulty) {
  return Math.max(1.3, Math.min(2.5, difficulty));
} 