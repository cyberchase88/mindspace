import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  // Support for schedule: from/to date range
  const { from, to } = req.query;
  const now = new Date();

  // If no from/to, legacy: return due up to now
  if (!from && !to) {
    const nowIso = now.toISOString();
    const { data, error } = await supabase
      .from('remembered_items')
      .select('*, note:note_id (id, title, content)')
      .eq('user_id', userId)
      .lte('next_review_at', nowIso);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ due: data });
  }

  // If from/to provided, return all items scheduled in that range
  // Default: from = now, to = 7 days from now
  let fromDate = from ? new Date(from) : now;
  let toDate = to ? new Date(to) : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // If 'to' is a date string without a time, set to end of that day
  if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) {
    // e.g., '2025-05-13' => '2025-05-13T23:59:59.999Z'
    const [year, month, day] = to.split('-');
    toDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
  }

  // ISO strings for Supabase
  const fromIso = fromDate.toISOString();
  const toIso = toDate.toISOString();

  const { data, error } = await supabase
    .from('remembered_items')
    .select('*, note:note_id (id, title, content)')
    .eq('user_id', userId)
    .gte('next_review_at', fromIso)
    .lte('next_review_at', toIso)
    .order('next_review_at', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ schedule: data, from: fromIso, to: toIso });
} 