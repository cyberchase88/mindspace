import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');
    const due_only = searchParams.get('due_only') === 'true';
    const note_ids_param = searchParams.get('note_ids');

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    let query = supabase
      .from('ai_questions')
      .select('*, ai_question_spaced_repetition(*), notes(title, content)')
      .eq('user_id', user_id);

    if (note_ids_param) {
      const noteIds = note_ids_param.split(',').map(id => id.trim()).filter(Boolean);
      if (noteIds.length > 0) {
        query = query.in('note_id', noteIds);
      }
    }

    if (due_only) {
      query = query.lte('ai_question_spaced_repetition.next_review_at', new Date().toISOString());
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ questions: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}