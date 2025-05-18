import fetch from 'node-fetch';
import { getStaticUserId } from '../supabase';

const BASE_URL = 'http://localhost:3000/api/spaced-repetition';
const userId = getStaticUserId();
const noteId = '1fd3480e-f204-492d-be03-b4b5c3e2b477'; // this is the note id for the note "Ice cream flavors", pls update this if that note is deleted

describe('Spaced Repetition API Integration', () => {
  it('should run the spaced repetition flow', async () => {
    // 1. Toggle "remember this" for the note
    let res = await fetch(`${BASE_URL}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noteId, userId }),
    });
    const toggleData = await res.json();
    console.log('Toggle API response:', toggleData, 'Status:', res.status);
    expect(res.status).toBe(200);
    expect(toggleData.remembered).toBe(true);

    // 2. Get due items
    res = await fetch(`${BASE_URL}/due?userId=${userId}`);
    expect(res.status).toBe(200);
    const dueData = await res.json();
    expect(Array.isArray(dueData.due)).toBe(true);
    expect(dueData.due.some(item => item.note_id === noteId)).toBe(true);

    // 3. Submit a review
    res = await fetch(`${BASE_URL}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noteId, quality: 4, userId }),
    });
    expect(res.status).toBe(200);
    const reviewData = await res.json();
    expect(reviewData.item).toBeDefined();
    expect(reviewData.review).toBeDefined();

    // 4. Get stats
    res = await fetch(`${BASE_URL}/stats?userId=${userId}`);
    expect(res.status).toBe(200);
    const statsData = await res.json();
    expect(statsData.stats.total_reviews).toBeGreaterThan(0);
  });
}); 