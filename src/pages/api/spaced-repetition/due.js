import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = req.query.userId || '00000000-0000-0000-0000-000000000000';

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('remembered_items')
    .select('*')
    .eq('user_id', userId)
    .lte('next_review_at', now);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ due: data });
} 