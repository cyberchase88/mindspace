import { google } from 'googleapis';
import { getTokensForUser, storeTokensForUser } from '../../../../lib/tokenStore';

export async function POST(req) {
  const { userId, event } = await req.json();
  const tokens = await getTokensForUser(userId);

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials(tokens);

  // Refresh token if needed
  if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    await storeTokensForUser(userId, credentials);
    oauth2Client.setCredentials(credentials);
  }

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event
    });
    return Response.json({ success: true, eventId: response.data.id });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}