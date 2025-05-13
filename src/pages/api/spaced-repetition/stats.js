import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = req.query.userId || '00000000-0000-0000-0000-000000000000';

  // Try to get stats from user_spaced_repetition_stats
  const { data: stats, error: statsErr } = await supabase
    .from('user_spaced_repetition_stats')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (stats && !statsErr) {
    return res.status(200).json({ stats });
  }

  // Fallback: aggregate from review_history
  const { data: history, error: histErr } = await supabase
    .from('review_history')
    .select('*')
    .eq('user_id', userId);
  if (histErr) return res.status(500).json({ error: histErr.message });

  const total = history.length;
  const successful = history.filter(r => r.success).length;
  const failed = total - successful;
  const avgResponse =
    total > 0
      ? history.reduce((sum, r) => sum + (r.response_time_ms || 0), 0) / total
      : null;
  const lastReviewed =
    total > 0
      ? history.reduce((latest, r) =>
          !latest || new Date(r.reviewed_at) > new Date(latest)
            ? r.reviewed_at
            : latest,
        null)
      : null;

  return res.status(200).json({
    stats: {
      user_id: userId,
      total_reviews: total,
      successful_reviews: successful,
      failed_reviews: failed,
      avg_response_time_ms: avgResponse,
      last_reviewed_at: lastReviewed,
    },
  });
} 