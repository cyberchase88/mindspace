import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { noteId, userId } = req.query;
  if (!noteId || !userId) {
    return res.status(400).json({ error: 'Missing noteId or userId' });
  }

  const { data, error } = await supabase
    .from('remembered_items')
    .select('*')
    .eq('user_id', userId)
    .eq('note_id', noteId)
    .single();

  // If not found, data will be null, which is fine
  if (error && error.code !== 'PGRST116') {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ remembered: !!data });
}