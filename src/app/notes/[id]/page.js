'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function NoteDetailPage() {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchNote() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        setError(error.message);
      } else {
        setNote(data);
      }
      setLoading(false);
    }
    if (id) fetchNote();
  }, [id]);

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>;
  if (error) return <div style={{ padding: 32, color: 'red' }}>Error: {error}</div>;
  if (!note) return <div style={{ padding: 32 }}>Note not found.</div>;

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 32, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <Link href="/" style={{ display: 'inline-block', marginBottom: 24, color: '#0070f3', textDecoration: 'none', fontWeight: 500 }}>
        ← Back to Notes
      </Link>
      <h1 style={{ fontSize: '2rem', marginBottom: 16 }}>{note.title}</h1>
      <div style={{ color: '#444', fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}>{note.content}</div>
      <div style={{ marginTop: 32, color: '#888', fontSize: '0.9rem' }}>
        Created: {new Date(note.created_at).toLocaleString()}
      </div>
    </div>
  );
} 