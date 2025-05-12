import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req) {
  try {
    const { user_id, device_id, role, content } = await req.json();
    if (!role || !content || (!user_id && !device_id)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const { data, error } = await supabase.from('chat_messages').insert([
      {
        user_id: user_id || null,
        device_id: device_id || null,
        role,
        content,
        timestamp: new Date().toISOString(),
      },
    ]).select().single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: data });
  } catch (err) {
    return NextResponse.json({ error: 'Server error: ' + err.message }, { status: 500 });
  }
} 