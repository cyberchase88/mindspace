// SM-2 algorithm for spaced repetition
export function updateSM2(sr, quality) {
    // quality: 0-5 (0=blackout, 5=perfect)
    let { interval_days, easiness_factor, repetitions } = sr;
    if (quality < 3) {
      repetitions = 0;
      interval_days = 1;
    } else {
      repetitions += 1;
      if (repetitions === 1) interval_days = 1;
      else if (repetitions === 2) interval_days = 6;
      else interval_days = Math.round(interval_days * easiness_factor);
    }
    // Update EF
    easiness_factor = Math.max(
      1.3,
      easiness_factor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
    );
    const next_review_at = new Date(Date.now() + interval_days * 24 * 60 * 60 * 1000).toISOString();
    return { interval_days, easiness_factor, repetitions, next_review_at };
  }