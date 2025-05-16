import { google } from 'googleapis';
import { storeTokensForUser } from 'src/lib/tokenStore';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    // TODO: Pass userId in state param and extract here for production
    const userId = 'a84fe585-37ac-4bf1-bc17-5ba87c228555'; // Replace with real userId from session or state

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Exchange code for tokens
    let tokens;
    try {
      const tokenResp = await oauth2Client.getToken(code);
      tokens = tokenResp.tokens || tokenResp;
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Failed to exchange code for tokens', details: err.message }), { status: 400 });
    }

    // Store tokens in Supabase
    try {
      await storeTokensForUser(userId, tokens);
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Failed to store tokens', details: err.message }), { status: 500 });
    }

    // Redirect to your app (e.g., settings page)
    return Response.redirect('http://localhost:3000/settings?connected=google', 302);
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Unexpected error', details: err.message }), { status: 500 });
  }
}