import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateActiveRecallQuestions } from '@/lib/aiQuestions';

export async function POST(req) {
  try {
    const { ai_question_id, user_id, note_content } = await req.json();
    if (!ai_question_id || !user_id || !note_content) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Generate a new question
    const [newQuestion] = await generateActiveRecallQuestions(note_content, 1);

    // Update question in DB
    const { data, error } = await supabase
      .from('ai_questions')
      .update({ question_text: newQuestion })
      .eq('id', ai_question_id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ question: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}