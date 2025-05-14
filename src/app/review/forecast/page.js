'use client';
import { useEffect, useState } from 'react';
import { calculateNextReview } from '@/lib/spacedRepetition';

const USER_ID = 'a84fe585-37ac-4bf1-bc17-5ba87c228555'; // hardcoded for now

function SRForecast({ spacedRepetition }) {
  // Simulate N future reviews (e.g., 10), assuming quality=4 each time
  const N = 20; // Simulate more steps to ensure we cover up to 1 year
  const forecast = [];
  let { interval_days, difficulty, next_review_at } = spacedRepetition;
  const today = new Date();
  let date = new Date(next_review_at);
  if (date < today) {
    // If next_review_at is in the past, start from today
    date = new Date(today);
  }
  const oneYearFromNow = new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000);
  for (let i = 0; i < N; i++) {
    if (date > oneYearFromNow) break;
    forecast.push({
      reviewNumber: i + 1,
      date: new Date(date),
      interval: interval_days,
      difficulty: difficulty,
    });
    // Simulate next review (quality=4)
    const { nextInterval, nextDifficulty } = calculateNextReview(interval_days, difficulty, 4);
    interval_days = nextInterval;
    difficulty = nextDifficulty;
    date = new Date(date.getTime() + interval_days * 24 * 60 * 60 * 1000);
  }
  const progress = Math.min(1, Math.max(0, (today - new Date(spacedRepetition.added_at)) / (oneYearFromNow - new Date(spacedRepetition.added_at))));
  const progressPercent = Math.round(progress * 100);
  const estMasteryDate = forecast.length > 0 ? forecast[forecast.length - 1].date : null;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 8 }}>
        <b>Next review:</b> {new Date(spacedRepetition.next_review_at).toLocaleDateString()} ({spacedRepetition.interval_days} days)
      </div>
      <div style={{ marginBottom: 8 }}>
        <b>Forecast (next 1 year):</b>
        <ul style={{ margin: '8px 0 0 16px', padding: 0 }}>
          {forecast.map(f => (
            <li key={f.reviewNumber}>
              Review {f.reviewNumber}: {f.date.toLocaleDateString()} (interval: {f.interval} days, difficulty: {f.difficulty.toFixed(2)})
            </li>
          ))}
        </ul>
        <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
          *Only reviews scheduled within the next 1 year (365 days) are shown. The underlying SM-2 algorithm is unmodified.
        </div>
      </div>
      <div style={{ margin: '12px 0' }}>
        <b>Last forecasted review date (within 1 year):</b> {estMasteryDate ? estMasteryDate.toLocaleDateString() : 'N/A'}
      </div>
      <div style={{ margin: '12px 0' }}>
        <b>Progress:</b> {progressPercent}% toward 1 year of review history
        <div style={{ background: '#e0e0e0', borderRadius: 6, height: 8, width: 240, overflow: 'hidden', marginTop: 4 }}>
          {progressPercent > 0 && (
            <div style={{ background: '#00C853', width: `${progressPercent}%`, height: '100%' }} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function SpacedRepetitionForecastPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/spaced-repetition/all-remembered?userId=${USER_ID}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load spaced repetition data');
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: 32 }}>Loading spaced repetition forecasts...</div>;
  if (error) return <div style={{ color: 'red', padding: 32 }}>{error}</div>;

  if (!items.length) {
    return <div style={{ color: '#207520', fontWeight: 400, fontStyle: 'italic', padding: 32 }}>
      No notes in your spaced repetition queue!
    </div>;
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 32, color: '#222' }}>
      <h1 style={{ marginBottom: 24 }}>Spaced Repetition Forecast (All Notes)</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {items.map(item => (
          <div key={item.id} style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: 20, background: '#fafafa' }}>
            <h2 style={{ fontSize: 18, marginBottom: 8 }}>{item.note?.title || 'Untitled Note'}</h2>
            <SRForecast spacedRepetition={item} />
          </div>
        ))}
      </div>
    </div>
  );
} 