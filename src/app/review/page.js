'use client';
import { useQuery } from '@tanstack/react-query';
import ReviewNoteCard from '@/components/features/ReviewNoteCard';

async function fetchDueNotes() {
  // TODO: Replace with real user ID/auth logic
  const userId = 'demo-user';
  const res = await fetch(`/api/spaced-repetition/due?userId=${userId}`);
  if (!res.ok) throw new Error('Failed to fetch due notes');
  const data = await res.json();
  return data.due || [];
}

export default function ReviewPage() {
  const { data: notes, isLoading, error } = useQuery({
    queryKey: ['due-notes'],
    queryFn: fetchDueNotes,
  });

  if (isLoading) return <div style={{ textAlign: 'center', marginTop: 64 }}>Loading due notes...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: 64 }}>Error: {error.message}</div>;
  if (!notes || notes.length === 0) {
    return <div style={{ textAlign: 'center', marginTop: 64, color: '#588157', fontWeight: 500 }}>No notes are due for review! 🌱</div>;
  }

  // For now, just show the first due note
  const note = notes[0];
  return <ReviewNoteCard note={note} />;
} 