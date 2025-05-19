import React, { useState } from 'react';
import CalendarEventModal from '../common/CalendarEventModal';

export default function AddToGoogleCalendarButton({
  userId,
  isGoogleConnected,
  suggestion,
  suggestionType,
  defaultRecurrence,
  defaultTime,
  onEventAdded,
}) {
  const [status, setStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const handleAdd = () => {
    if (!isGoogleConnected) {
      alert('Please connect your Google account before adding events.');
      window.location.href = '/settings?returnTo=' + encodeURIComponent(window.location.pathname);
      return;
    }
    setModalOpen(true);
  };

  const handleConfirm = async ({ title, date, time, recurrence }) => {
    setStatus('Adding...');
    setModalOpen(false);
    try {
      // Build event object with correct date/time fields
      let event = {
        summary: title,
        description: suggestion,
      };
      if (date) {
        if (time) {
          // Timed event: use dateTime and add 1 hour to end
          const start = new Date(`${date}T${time}`);
          const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour
          event.start = {
            dateTime: start.toISOString(),
            timeZone: 'America/Los_Angeles',
          };
          event.end = {
            dateTime: end.toISOString(),
            timeZone: 'America/Los_Angeles',
          };
        } else {
          // All-day event: use date only
          event.start = { date };
          event.end = { date };
        }
      }
      if (suggestionType === 'habit' && recurrence) {
        // Basic RRULE mapping
        let rule = '';
        if (recurrence === 'daily') rule = 'RRULE:FREQ=DAILY';
        else if (recurrence === 'weekly') rule = 'RRULE:FREQ=WEEKLY';
        else if (recurrence === 'weekdays') rule = 'RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR';
        else if (recurrence === 'mon_wed_fri') rule = 'RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR';
        else if (recurrence === 'tue_thu') rule = 'RRULE:FREQ=WEEKLY;BYDAY=TU,TH';
        if (rule) event.recurrence = [rule];
      }
      const calendarId = (typeof window !== 'undefined' && window.sessionStorage.getItem('googleEmail')) || 'primary';
      const res = await fetch('/api/calendar/app-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, event, calendarId })
      });
      if (!res.ok) throw new Error('Failed to add event');
      setStatus('Added!');
      if (onEventAdded) onEventAdded();
    } catch (e) {
      setStatus('Error: ' + e.message);
    }
  };

  return (
    <>
      <button onClick={handleAdd} disabled={status === 'Adding...'}>
        {status || 'Add to Google Calendar'}
      </button>
      <CalendarEventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
        initialSuggestion={suggestion}
        initialRecurrence={defaultRecurrence}
        initialTime={defaultTime}
        type={suggestionType}
      />
    </>
  );
}