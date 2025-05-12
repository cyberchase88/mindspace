import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prepareNotesForAI } from '@/lib/aiUtils';

export async function POST(req) {
  try {
    const { message, context } = await req.json();
    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing OpenAI API key' }, { status: 500 });
    }

    let systemPrompt = '';
    if (context && context.note) {
      // Fetch all notes
      const { data: notes, error } = await supabase.from('notes').select('*');
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      const aiReadyNotes = prepareNotesForAI(notes);
      // Separate current note from others
      const currentNote = context.note;
      const otherNotes = aiReadyNotes.filter(n => n.id !== currentNote.id);
      const currentNoteText = `Title: ${currentNote.title}\nContent: ${currentNote.content}`;
      const otherNotesText = otherNotes.length > 0
        ? otherNotes.map(note => `Title: ${note.title}\nContent: ${note.content}`).join('\n---\n')
        : 'None';
      systemPrompt = `You are a helpful assistant. The user has a collection of personal notes.\n\nThe currently open note is:\n${currentNoteText}\n\nHere are the user's other notes:\n${otherNotesText}\n\nWhen answering, prioritize the current note if relevant, but you may reference other notes as needed. If the answer is not present in any note, use your general knowledge. If the user asks a general question, answer it as you normally would.`;
    } else {
      // No current note, just use all notes
      const { data: notes, error } = await supabase.from('notes').select('*');
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      const aiReadyNotes = prepareNotesForAI(notes);
      const notesText = aiReadyNotes.length > 0
        ? aiReadyNotes.map(note => `Title: ${note.title}\nContent: ${note.content}`).join('\n---\n')
        : 'None';
      systemPrompt = `You are a helpful assistant. The user has a collection of personal notes:\n${notesText}\n\nWhen answering, use the notes as your primary source if possible. If the answer is not present in any note, use your general knowledge. If the user asks a general question, answer it as you normally would.`;
    }

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        max_tokens: 512,
        temperature: 0.7,
      }),
    });
    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      return NextResponse.json({ error: 'OpenAI error: ' + err }, { status: 500 });
    }
    const data = await openaiRes.json();
    const text = data.choices?.[0]?.message?.content?.trim() || 'No response.';
    return NextResponse.json({ text });
  } catch (err) {
    return NextResponse.json({ error: 'Server error: ' + err.message }, { status: 500 });
  }
} 