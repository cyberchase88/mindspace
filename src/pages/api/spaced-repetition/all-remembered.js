import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  // Fetch all remembered_items for the user, including note metadata
  const { data, error } = await supabase
    .from('remembered_items')
    .select('*, note:note_id (id, title, content)')
    .eq('user_id', userId)
    .order('next_review_at', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ items: data });
} 