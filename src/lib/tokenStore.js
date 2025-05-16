// src/lib/tokenStore.js

import { supabase } from './supabase';

/**
 * Stores (upserts) OAuth tokens for a user and provider in Supabase.
 * @param {string} userId - The user's ID.
 * @param {object} tokens - The token object (access_token, refresh_token, expires_at, scope, token_type).
 * @param {string} provider - The OAuth provider (e.g., 'google').
 * @returns {Promise<object>} The upserted token row or error.
 */
export async function storeTokensForUser(userId, tokens, provider = 'google') {
  let { access_token, refresh_token, expires_at, scope, token_type } = tokens;
  // If refresh_token is missing, fetch the existing one
  if (!refresh_token) {
    const { data: existing, error: getError } = await supabase
      .from('oauth_tokens')
      .select('refresh_token')
      .eq('user_id', userId)
      .eq('provider', provider)
      .single();
    if (existing && existing.refresh_token) {
      refresh_token = existing.refresh_token;
    }
  }
  const { data, error } = await supabase
    .from('oauth_tokens')
    .upsert([
      {
        user_id: userId,
        provider,
        access_token,
        refresh_token,
        expires_at: expires_at ? new Date(expires_at * 1000).toISOString() : null, // if expires_at is a unix timestamp
        scope,
        token_type,
        updated_at: new Date().toISOString(),
      },
    ], { onConflict: ['user_id', 'provider'] })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Retrieves OAuth tokens for a user and provider from Supabase.
 * @param {string} userId - The user's ID.
 * @param {string} provider - The OAuth provider (e.g., 'google').
 * @returns {Promise<object|null>} The token row or null if not found.
 */
export async function getTokensForUser(userId, provider = 'google') {
  const { data, error } = await supabase
    .from('oauth_tokens')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', provider)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}