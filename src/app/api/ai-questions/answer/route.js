import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { updateSM2 } from '@/lib/sm2';
import { getAIRecallScore } from '@/lib/aiQuestions';

export async function POST(req) {
  try {
    const { ai_question_id, user_id, answer_text } = await req.json();
    if (!ai_question_id || !user_id || !answer_text) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Fetch the original note content for this question
    const { data: question, error: qErr } = await supabase
      .from('ai_questions')
      .select('note_id')
      .eq('id', ai_question_id)
      .single();
    if (qErr || !question) return NextResponse.json({ error: 'Question not found' }, { status: 404 });

    const { data: note, error: nErr } = await supabase
      .from('notes')
      .select('content')
      .eq('id', question.note_id)
      .single();
    if (nErr || !note) return NextResponse.json({ error: 'Note not found' }, { status: 404 });

    // Get AI-generated recall score and feedback
    const { score, feedback } = await getAIRecallScore(note.content, answer_text);

    // Store answer, score, and feedback
    const { data: answer, error: answerErr } = await supabase
      .from('ai_question_answers')
      .insert([{ ai_question_id, user_id, answer_text, recall_rating: score, feedback }])
      .select()
      .single();
    if (answerErr) return NextResponse.json({ error: answerErr.message }, { status: 500 });

    // Get current spaced repetition state
    const { data: sr, error: srErr } = await supabase
      .from('ai_question_spaced_repetition')
      .select('*')
      .eq('ai_question_id', ai_question_id)
      .eq('user_id', user_id)
      .single();
    if (srErr) return NextResponse.json({ error: srErr.message }, { status: 500 });

    // Update spaced repetition using SM-2 and AI score
    const updatedSR = updateSM2(sr, score);

    const { error: updateErr } = await supabase
      .from('ai_question_spaced_repetition')
      .update(updatedSR)
      .eq('id', sr.id);
    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

    return NextResponse.json({
      answer,
      spaced_repetition: { ...sr, ...updatedSR },
      ai_score: score,
      ai_feedback: feedback,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}