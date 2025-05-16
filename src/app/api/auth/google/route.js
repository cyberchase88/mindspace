import { google } from 'googleapis';
import { getTokensForUser } from 'src/lib/tokenStore';

export async function GET(req) {
  // Hardcoded userId for local testing
  const userId = 'a84fe585-37ac-4bf1-bc17-5ba87c228555';
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  const scopes = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email'
  ];
  // Check if user already has a refresh token
  const tokens = await getTokensForUser(userId);
  const needsConsent = !tokens || !tokens.refresh_token;
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: needsConsent ? 'consent' : undefined,
    scope: scopes,
    state: JSON.stringify({ userId })
  });
  return Response.redirect(url, 302);
}