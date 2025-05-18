import { supabase } from '@/lib/supabase';
import { calculateNextReview } from '@/lib/spacedRepetition';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { noteId, quality, userId: bodyUserId } = req.body;
  const userId = bodyUserId;
  if (!noteId || typeof quality !== 'number' || !userId) {
    return res.status(400).json({ error: 'Missing noteId, quality, or userId' });
  }

  // Get the remembered item
  const { data: item, error: findErr } = await supabase
    .from('remembered_items')
    .select('*')
    .eq('user_id', userId)
    .eq('note_id', noteId)
    .single();
  if (findErr || !item) {
    return res.status(404).json({ error: 'Remembered item not found' });
  }

  // Calculate new interval/difficulty
  const { nextInterval, nextDifficulty } = calculateNextReview(
    item.interval_days,
    item.difficulty,
    quality
  );
  const nextReviewAt = new Date(Date.now() + nextInterval * 24 * 60 * 60 * 1000).toISOString();

  // Update remembered_items
  const { data: updated, error: updateErr } = await supabase
    .from('remembered_items')
    .update({
      interval_days: nextInterval,
      difficulty: nextDifficulty,
      next_review_at: nextReviewAt,
    })
    .eq('id', item.id)
    .select()
    .single();
  if (updateErr) return res.status(500).json({ error: updateErr.message });

  // Insert review_history
  const { data: review, error: histErr } = await supabase
    .from('review_history')
    .insert([
      {
        remembered_item_id: item.id,
        user_id: userId,
        reviewed_at: new Date().toISOString(),
        success: quality >= 3,
        difficulty_before: item.difficulty,
        interval_before: item.interval_days,
      },
    ])
    .select()
    .single();
  if (histErr) return res.status(500).json({ error: histErr.message });

  return res.status(200).json({ item: updated, review });
} 