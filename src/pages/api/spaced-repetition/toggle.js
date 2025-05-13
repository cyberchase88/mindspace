import { supabase } from '@/lib/supabase';
import { initialReview } from '@/lib/spacedRepetition';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { noteId, userId: bodyUserId } = req.body;
  const userId = bodyUserId || '00000000-0000-0000-0000-000000000000';
  if (!noteId) {
    return res.status(400).json({ error: 'Missing noteId' });
  }

  // Check if already remembered
  const { data: existing, error: findErr } = await supabase
    .from('remembered_items')
    .select('*')
    .eq('user_id', userId)
    .eq('note_id', noteId)
    .single();

  if (findErr && findErr.code !== 'PGRST116') {
    return res.status(500).json({ error: findErr.message });
  }

  if (existing) {
    // Remove from remembered
    const { error: delErr } = await supabase
      .from('remembered_items')
      .delete()
      .eq('id', existing.id);
    if (delErr) return res.status(500).json({ error: delErr.message });
    return res.status(200).json({ remembered: false });
  } else {
    // Add to remembered
    const { nextInterval, nextDifficulty } = initialReview();
    const { data, error: insErr } = await supabase
      .from('remembered_items')
      .insert([
        {
          user_id: userId,
          note_id: noteId,
          added_at: new Date().toISOString(),
          next_review_at: new Date().toISOString(),
          interval_days: nextInterval,
          difficulty: nextDifficulty,
        },
      ])
      .select()
      .single();
    if (insErr) return res.status(500).json({ error: insErr.message });
    return res.status(200).json({ remembered: true, item: data });
  }
} 