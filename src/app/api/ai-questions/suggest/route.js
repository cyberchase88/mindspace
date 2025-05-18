import { NextResponse } from 'next/server';
import { getEventSuggestion } from '@/lib/aiEventSuggestion';

export async function POST(req) {
  try {
    const { title, content } = await req.json();
    if (!title || !content) {
      return NextResponse.json({ error: 'Missing title or content' }, { status: 400 });
    }
    const suggestion = await getEventSuggestion({ title, content });
    return NextResponse.json({ suggestion });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
} 