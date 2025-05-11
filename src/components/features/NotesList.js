'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Masonry from 'react-masonry-css';
import styles from './NotesList.module.scss';

async function fetchNotes() {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Function to determine note size based on content length
const getNoteSize = (content) => {
  const length = content.length;
  if (length < 100) return 'small';
  if (length < 300) return 'medium';
  return 'large';
};

const breakpointColumnsObj = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1,
};

export default function NotesList() {
  const { data: notes, isLoading, error } = useQuery({
    queryKey: ['notes'],
    queryFn: fetchNotes,
  });

  return (
    <div className={styles.notesList}>
      <div className={styles.header}>
        <h2>Your Garden of Thoughts</h2>
        <Link href="/notes/new" className={styles.newButton}>
          Plant New Thought
        </Link>
      </div>
      {isLoading ? (
        <div className={styles.loading}>Loading notes...</div>
      ) : error ? (
        <div className={styles.error}>Error: {error.message}</div>
      ) : notes.length === 0 ? (
        <div className={styles.empty}>
          <p>Your garden is empty. Plant your first thought!</p>
        </div>
      ) : (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className={styles.masonryGrid}
          columnClassName={styles.masonryColumn}
        >
          {notes.map(note => {
            const size = getNoteSize(note.content);
            return (
              <Link 
                href={`/notes/${note.id}`} 
                key={note.id} 
                className={`${styles.noteCard} ${styles[size]}`}
              >
                <h3>{note.title}</h3>
                <p className={styles.preview}>
                  {note.content.substring(0, size === 'small' ? 100 : size === 'medium' ? 200 : 300)}
                  {note.content.length > (size === 'small' ? 100 : size === 'medium' ? 200 : 300) ? '...' : ''}
                </p>
                <time className={styles.date}>
                  {new Date(note.created_at).toLocaleDateString()}
                </time>
              </Link>
            );
          })}
        </Masonry>
      )}
    </div>
  );
} 