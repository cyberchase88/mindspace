import { google } from 'googleapis';
import { storeTokensForUser, getTokensForUser } from 'src/lib/tokenStore';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    // Extract userId and returnTo from state param
    let userId, returnTo;
    try {
      const state = searchParams.get('state');
      if (state) {
        const parsed = JSON.parse(state);
        userId = parsed.userId;
        returnTo = parsed.returnTo;
      } else {
        userId = null;
        returnTo = null;
      }
    } catch {
      userId = null;
      returnTo = null;
    }
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId in state' }), { status: 400 });
    }
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
    // Ensure we never overwrite a valid refresh_token with undefined
    if (!tokens.refresh_token) {
      const existing = await getTokensForUser(userId);
      if (existing && existing.refresh_token) {
        tokens.refresh_token = existing.refresh_token;
      }
    }
    // Store tokens in Supabase
    try {
      await storeTokensForUser(userId, tokens);
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Failed to store tokens', details: err.message }), { status: 500 });
    }
    // Instead of fetching email, just use a placeholder
    const email = 'connected';
    // Redirect to your app (e.g., settings page) with a generic success
    return Response.redirect(`http://localhost:3000/settings?connected=google&email=${encodeURIComponent(email)}${returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ''}` , 302);
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Unexpected error', details: err.message }), { status: 500 });
  }
}