import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');
    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('ai_question_answers')
      .select('*, ai_questions(question_text, note_id)')
      .eq('user_id', user_id)
      .order('reviewed_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ history: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}