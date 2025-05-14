'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const USER_ID = 'a84fe585-37ac-4bf1-bc17-5ba87c228555'; // hardcoded for now

function groupByDay(schedule) {
  return schedule.reduce((acc, item) => {
    const day = item.next_review_at.slice(0, 10); // YYYY-MM-DD
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {});
}

export default function SpacedRepetitionSchedulePage() {
  const [schedule, setSchedule] = useState([]);
  const [from, setFrom] = useState(new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showingDays, setShowingDays] = useState(7);
  const [dateFromInput, setDateFromInput] = useState(from);
  const [dateToInput, setDateToInput] = useState(to);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(
      `/api/spaced-repetition/due?userId=${USER_ID}&from=${from}&to=${to}`
    )
      .then((res) => res.json())
      .then((data) => {
        setSchedule(data.schedule || []);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load schedule');
        setLoading(false);
      });
  }, [from, to]);

  function handleShowMore() {
    const moreDays = showingDays + 7;
    setShowingDays(moreDays);
    setTo(
      new Date(Date.now() + moreDays * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10)
    );
  }

  function handleShowCustomRange() {
    setFrom(dateFromInput);
    setTo(dateToInput);
    setShowingDays(
      Math.ceil(
        (new Date(dateToInput) - new Date(dateFromInput)) / (1000 * 60 * 60 * 24)
      )
    );
  }

  if (loading) return <div style={{ padding: 32 }}>Loading schedule...</div>;
  if (error)
    return <div style={{ color: 'red', padding: 32 }}>Error: {error}</div>;

  const grouped = groupByDay(schedule);
  const days = Object.keys(grouped).sort();
  const todayString = new Date().toISOString().slice(0, 10);
  const todaysItems = grouped[todayString] || [];
  const todaysNoteIds = todaysItems.map(item => item.note?.id).filter(Boolean);

  function startReviewForDay(noteIds) {
    if (!noteIds.length) return;
    router.push(`/review?noteIds=${noteIds.join(',')}`);
  }

  return (
    <>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: 32, color: '#222' }}>
        <h1 style={{ marginBottom: 24 }}>Spaced Repetition Schedule</h1>
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <label>
            From:{' '}
            <input
              type="date"
              value={dateFromInput}
              onChange={e => setDateFromInput(e.target.value)}
              style={{ marginRight: 8 }}
            />
          </label>
          <label>
            To:{' '}
            <input
              type="date"
              value={dateToInput}
              onChange={e => setDateToInput(e.target.value)}
              style={{ marginRight: 8 }}
            />
          </label>
          <button onClick={handleShowCustomRange} style={{ padding: '4px 12px' }}>
            Show Schedule
          </button>
        </div>
        {schedule.length === 0 ? (
          <div style={{ color: '#207520', fontWeight: 400, fontStyle: 'italic', padding: 32 }}>
            No reviews scheduled in this range!
          </div>
        ) : (
          <>
            {days.map((day) => (
              <div key={day} style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, marginBottom: 8 }}>
                  {day}
                  {day === todayString && todaysNoteIds.length > 0 && (
                    <button
                      style={{ marginLeft: 16, fontSize: 14, padding: '4px 10px' }}
                      onClick={() => startReviewForDay(todaysNoteIds)}
                    >
                      Start Review
                    </button>
                  )}
                </h2>
                <ul style={{ paddingLeft: 24 }}>
                  {grouped[day].map((item) => (
                    <li key={item.id} style={{ marginBottom: 6 }}>
                      <b>{item.note?.title || 'Untitled Note'}</b>
                      <span style={{ color: '#888', marginLeft: 8 }}>
                        {new Date(item.next_review_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <button onClick={handleShowMore} style={{ marginTop: 24 }}>
              Show next 7 days
            </button>
          </>
        )}
      </div>
    </>
  );
} 