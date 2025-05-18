import React, { useState } from 'react';

export default function CalendarEventModal({
  open,
  onClose,
  onConfirm,
  initialSuggestion = '',
  initialRecurrence = '',
  initialTime = '',
  type = 'one_time_action',
}) {
  const [title, setTitle] = useState(initialSuggestion);
  const [date, setDate] = useState('');
  const [time, setTime] = useState(initialTime);
  const [recurrence, setRecurrence] = useState(initialRecurrence);

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.3)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ background: '#fff', borderRadius: 8, padding: 24, minWidth: 320, maxWidth: 400, boxShadow: '0 2px 16px rgba(0,0,0,0.15)' }}>
        <h2 style={{ marginTop: 0 }}>Schedule Event</h2>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Event Title
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{ width: '100%', marginTop: 4 }}
          />
        </label>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Date
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ width: '100%', marginTop: 4 }}
          />
        </label>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Time (optional)
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            style={{ width: '100%', marginTop: 4 }}
          />
        </label>
        {type === 'habit' && (
          <label style={{ display: 'block', marginBottom: 8 }}>
            Recurrence
            <select
              value={recurrence}
              onChange={e => setRecurrence(e.target.value)}
              style={{ width: '100%', marginTop: 4 }}
            >
              <option value="">Custom...</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="weekdays">Weekdays (Mon-Fri)</option>
              <option value="mon_wed_fri">Mon/Wed/Fri</option>
              <option value="tue_thu">Tue/Thu</option>
            </select>
          </label>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button onClick={onClose} style={{ padding: '6px 16px' }}>Cancel</button>
          <button
            onClick={() => onConfirm({ title, date, time, recurrence })}
            style={{ padding: '6px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}
            disabled={!title || !date}
          >
            Add to Calendar
          </button>
        </div>
      </div>
    </div>
  );
} 