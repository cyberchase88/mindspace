// src/lib/tokenStore.js

const tokenDB = {}; // In-memory store: { [userId]: tokens }

export async function storeTokensForUser(userId, tokens) {
  tokenDB[userId] = tokens;
}

export async function getTokensForUser(userId) {
  return tokenDB[userId];
}