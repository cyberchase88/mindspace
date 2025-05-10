'use client';

import { useQuery } from '@tanstack/react-query';
import { notesApi } from '@/lib/api/notes';
import styles from './NotesList.module.scss';

export default function NotesList() {
  const { data: notes, isLoading, error } = useQuery({
    queryKey: ['notes'],
    queryFn: notesApi.getNotes,
  });

  if (isLoading) {
    return <div className={styles.loading}>Loading notes...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error.message}</div>;
  }

  return (
    <div className={styles.notesList}>
      <h2>Your Notes</h2>
      <div className={styles.grid}>
        {notes.map(note => (
          <div key={note.id} className={styles.noteCard}>
            <h3>{note.title}</h3>
            <p>{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 