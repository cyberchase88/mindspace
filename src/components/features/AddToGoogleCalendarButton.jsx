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
      const calendarId = 'c4740f2d8d4adda8f155f64853659f440f6d6dbb1f3b7c83056d3cfef250a454@group.calendar.google.com';

      const res = await fetch('/api/calendar/app-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, event, calendarId })
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
  const timeZone = 'America/Los_Angeles';
  if (suggestion.type === 'recurring') {
    return {
      summary: suggestion.title,
      description: suggestion.description,
      start: { dateTime: suggestion.startDateTime, timeZone },
      end: { dateTime: suggestion.endDateTime, timeZone },
      recurrence: ['RRULE:FREQ=DAILY']
    };
  }
  return {
    summary: suggestion.title,
    description: suggestion.description,
    start: { dateTime: suggestion.startDateTime, timeZone },
    end: { dateTime: suggestion.endDateTime, timeZone }
  };
}