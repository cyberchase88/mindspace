import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateActiveRecallQuestions } from '@/lib/aiQuestions';

export async function POST(req) {
  try {
    const { note_id, user_id, note_content } = await req.json();
    if (!note_id || !user_id || !note_content) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Generate questions using OpenAI
    const questions = await generateActiveRecallQuestions(note_content);

    // Store questions in DB
    const inserts = [];
    for (const q of questions) {
      const { data, error } = await supabase
        .from('ai_questions')
        .insert([{ note_id, user_id, question_text: q, model_used: 'gpt-3.5-turbo' }])
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      inserts.push(data);

      // Create spaced repetition entry
      await supabase.from('ai_question_spaced_repetition').insert([
        {
          ai_question_id: data.id,
          user_id,
          interval_days: 1,
          easiness_factor: 2.5,
          repetitions: 0,
          next_review_at: new Date().toISOString(),
        },
      ]);
    }

    return NextResponse.json({ questions: inserts });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}