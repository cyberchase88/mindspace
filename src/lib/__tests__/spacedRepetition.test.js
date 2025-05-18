import { calculateNextReview, initialReview, clampDifficulty } from '../spacedRepetition';

describe('Spaced Repetition Algorithm (SM-2)', () => {
  test('initialReview returns correct defaults', () => {
    const { nextInterval, nextDifficulty } = initialReview();
    expect(nextInterval).toBe(1);
    expect(nextDifficulty).toBe(2.5);
  });

  test('calculateNextReview resets interval on failure (quality < 3)', () => {
    const { nextInterval, nextDifficulty } = calculateNextReview(6, 2.5, 2);
    expect(nextInterval).toBe(1);
    expect(nextDifficulty).toBeLessThan(2.5);
  });

  test('calculateNextReview increases interval on success (quality >= 3)', () => {
    const { nextInterval, nextDifficulty } = calculateNextReview(1, 2.5, 5);
    expect(nextInterval).toBe(6);
    expect(nextDifficulty).toBe(2.5);
  });

  test('difficulty is clamped between 1.3 and 2.5', () => {
    expect(clampDifficulty(0.5)).toBe(1.3);
    expect(clampDifficulty(3.0)).toBe(2.5);
    expect(clampDifficulty(2.0)).toBe(2.0);
  });

  test('calculateNextReview handles edge cases', () => {
    // Minimum difficulty
    const { nextDifficulty: minDiff } = calculateNextReview(1, 1.3, 0);
    expect(minDiff).toBeGreaterThanOrEqual(1.3);
    // Maximum difficulty
    const { nextDifficulty: maxDiff } = calculateNextReview(1, 2.5, 5);
    expect(maxDiff).toBeLessThanOrEqual(2.5);
  });
}); 