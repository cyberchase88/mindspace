'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Masonry from 'react-masonry-css';
import styles from './NotesList.module.scss';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

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

// Function to truncate content to 3 lines or ~200 characters
const truncateContent = (content) => {
  const maxLength = 200;
  const truncated = content.substring(0, maxLength);
  return truncated.length < content.length ? truncated + '...' : truncated;
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
            const previewContent = truncateContent(note.content);
            const renderedPreview = marked(previewContent);
            
            return (
              <Link 
                href={`/notes/${note.id}`} 
                key={note.id} 
                className={`${styles.noteCard} ${styles[size]}`}
              >
                <h3>{note.title}</h3>
                <div 
                  className={styles.preview}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(renderedPreview)
                  }}
                />
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