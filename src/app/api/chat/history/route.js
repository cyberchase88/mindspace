import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const device_id = searchParams.get('device_id');
    // Assume user_id is available via Supabase auth (if using RLS, etc.)
    // For now, try to get user_id from headers (custom, e.g., x-user-id) or session (if available)
    const user_id = req.headers.get('x-user-id') || null;
    if (!user_id && !device_id) {
      return NextResponse.json({ error: 'No user_id or device_id provided' }, { status: 400 });
    }
    let query = supabase.from('chat_messages').select('*').order('timestamp', { ascending: false }).limit(25);
    if (user_id) {
      query = query.eq('user_id', user_id);
    } else {
      query = query.eq('device_id', device_id);
    }
    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    // Return in ascending order (oldest first)
    const messages = (data || []).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    return NextResponse.json({ messages });
  } catch (err) {
    return NextResponse.json({ error: 'Server error: ' + err.message }, { status: 500 });
  }
} 