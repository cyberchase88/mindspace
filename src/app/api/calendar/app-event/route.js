import { google } from 'googleapis';
import { getTokensForUser, storeTokensForUser } from '../../../../lib/tokenStore';

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, '');
}

export async function POST(req) {
  try {
    const { userId, event, calendarId } = await req.json();
    const tokens = await getTokensForUser(userId);
    if (!tokens) {
      return new Response(JSON.stringify({ error: 'No Google tokens found for user.' }), { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials(tokens);

    // Refresh token if needed (check expires_at as ISO string)
    let refreshed = false;
    if (tokens.expires_at) {
      if (new Date(tokens.expires_at).getTime() < Date.now()) {
        try {
          const { credentials } = await oauth2Client.refreshAccessToken();
          await storeTokensForUser(userId, credentials);
          oauth2Client.setCredentials(credentials);
          refreshed = true;
        } catch (err) {
          console.error('Failed to refresh Google token:', err);
          return new Response(JSON.stringify({ error: 'Failed to refresh Google token', details: err.message }), { status: 401 });
        }
      }
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    try {
      // Ensure event.description is plain text
      if (event && event.description) {
        event.description = stripHtml(event.description);
      }
      const response = await calendar.events.insert({
        calendarId: calendarId || 'primary',
        requestBody: event
      });
      return Response.json({ success: true, eventId: response.data.id, refreshed });
    } catch (err) {
      console.error('Google Calendar API error:', err);
      return Response.json({ error: err.message, details: err }, { status: 500 });
    }
  } catch (err) {
    console.error('Unexpected error in app-event:', err);
    return new Response(JSON.stringify({ error: 'Unexpected error', details: err.message }), { status: 500 });
  }
}