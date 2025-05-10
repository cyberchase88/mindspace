'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import styles from './NotesList.module.scss';

async function fetchNotes() {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export default function NotesList() {
  const { data: notes, isLoading, error } = useQuery({
    queryKey: ['notes'],
    queryFn: fetchNotes,
  });

  if (isLoading) {
    return <div className={styles.loading}>Loading notes...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error.message}</div>;
  }

  return (
    <div className={styles.notesList}>
      <div className={styles.header}>
        <h2>Your Notes</h2>
        <Link href="/notes/new" className={styles.newButton}>
          New Note
        </Link>
      </div>

      {notes.length === 0 ? (
        <div className={styles.empty}>
          <p>No notes yet. Create your first note!</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {notes.map(note => (
            <Link href={`/notes/${note.id}`} key={note.id} className={styles.noteCard}>
              <h3>{note.title}</h3>
              <p className={styles.preview}>
                {note.content.substring(0, 150)}
                {note.content.length > 150 ? '...' : ''}
              </p>
              <time className={styles.date}>
                {new Date(note.created_at).toLocaleDateString()}
              </time>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 