import { google } from 'googleapis';
import { storeTokensForUser } from 'src/lib/tokenStore';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  // Pass userId in state param for production
  const userId = 'a84fe585-37ac-4bf1-bc17-5ba87c228555'; // Replace with real userId from session or state

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const { tokens } = await oauth2Client.getToken(code);

  await storeTokensForUser(userId, tokens);

  // Redirect to your app (e.g., settings page)
  return Response.redirect('http://localhost:3000/settings?connected=google', 302);
}