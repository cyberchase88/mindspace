'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Masonry from 'react-masonry-css';
import styles from './CardView.module.scss';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import AddToGoogleCalendarButton from './AddToGoogleCalendarButton';

async function fetchNotes() {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

const breakpointColumns = {
  default: 4,
  1400: 3,
  1100: 2,
  700: 1,
};

export default function CardView() {
  const { data: notes, isLoading, error } = useQuery({
    queryKey: ['notes'],
    queryFn: fetchNotes,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className={styles.container}>
      <Masonry
        breakpointCols={breakpointColumns}
        className={styles.masonryGrid}
        columnClassName={styles.masonryGridColumn}
      >
        {notes?.map((note) => (
          <Link href={`/notes/${note.id}`} key={note.id} className={styles.cardLink}>
            <article className={styles.card}>
              <h2 className={styles.cardTitle}>{note.title}</h2>
              <div
                className={styles.cardContent}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(marked(note.content.slice(0, 200) + '...')),
                }}
              />
              <AddToGoogleCalendarButton
                userId="demo-user"
                isGoogleConnected={false}
                suggestion={{
                  type: 'recurring',
                  title: 'Morning Yoga',
                  description: '10 min morning yoga',
                  startDateTime: '2024-06-10T08:00:00-07:00',
                  endDateTime: '2024-06-10T08:10:00-07:00',
                }}
              />
              <div className={styles.cardFooter}>
                <time dateTime={note.created_at}>
                  {new Date(note.created_at).toLocaleDateString()}
                </time>
              </div>
            </article>
          </Link>
        ))}
      </Masonry>
    </div>
  );
} 