import React, { useState } from 'react';

export default function AddToGoogleCalendarButton({ userId, suggestion, isGoogleConnected }) {
  const [status, setStatus] = useState('');

  const handleAdd = async () => {
    setStatus('Adding...');
    try {
      if (!isGoogleConnected) {
        window.location.href = '/api/auth/google';
        return;
      }

      const event = suggestionToEvent(suggestion);

      const res = await fetch('/api/calendar/add-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, event })
      });

      if (!res.ok) throw new Error('Failed to add event');
      setStatus('Added!');
    } catch (e) {
      setStatus('Error: ' + e.message);
    }
  };

  return (
    <button onClick={handleAdd} disabled={status === 'Adding...'}>
      {status || 'Add to Google Calendar'}
    </button>
  );
}

function suggestionToEvent(suggestion) {
  if (suggestion.type === 'recurring') {
    return {
      summary: suggestion.title,
      description: suggestion.description,
      start: { dateTime: suggestion.startDateTime },
      end: { dateTime: suggestion.endDateTime },
      recurrence: ['RRULE:FREQ=DAILY']
    };
  }
  return {
    summary: suggestion.title,
    description: suggestion.description,
    start: { dateTime: suggestion.startDateTime },
    end: { dateTime: suggestion.endDateTime }
  };
}