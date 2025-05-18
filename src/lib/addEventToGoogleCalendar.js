// Utility to add an event to Google Calendar via the backend API
export async function addEventToGoogleCalendar({ userId, title, date, time, recurrence, description }) {
  try {
    let event = {
      summary: title,
      description: description || '',
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
    if (recurrence) {
      // Basic RRULE mapping
      let rule = '';
      if (recurrence === 'daily') rule = 'RRULE:FREQ=DAILY';
      else if (recurrence === 'weekly') rule = 'RRULE:FREQ=WEEKLY';
      else if (recurrence === 'weekdays') rule = 'RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR';
      else if (recurrence === 'mon_wed_fri') rule = 'RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR';
      else if (recurrence === 'tue_thu') rule = 'RRULE:FREQ=WEEKLY;BYDAY=TU,TH';
      if (rule) event.recurrence = [rule];
    }
    const calendarId = 'c4740f2d8d4adda8f155f64853659f440f6d6dbb1f3b7c83056d3cfef250a454@group.calendar.google.com';
    const res = await fetch('/api/calendar/app-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, event, calendarId })
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to add event');
    }
    return await res.json();
  } catch (e) {
    return { error: e.message };
  }
} 