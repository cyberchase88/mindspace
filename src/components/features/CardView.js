'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Masonry from 'react-masonry-css';
import styles from './CardView.module.scss';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import AddToGoogleCalendarButton from './AddToGoogleCalendarButton';
import { useEffect, useState } from 'react';

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

const HARDCODED_USER_ID = 'a84fe585-37ac-4bf1-bc17-5ba87c228555';

export default function CardView() {
  const { data: notes, isLoading, error } = useQuery({
    queryKey: ['notes'],
    queryFn: fetchNotes,
  });

  // Google connection state
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  useEffect(() => {
    async function checkGoogleConnection() {
      // Check if the user has Google tokens
      const { data, error } = await supabase
        .from('oauth_tokens')
        .select('*')
        .eq('user_id', HARDCODED_USER_ID)
        .eq('provider', 'google')
        .single();
      setIsGoogleConnected(!!(data && data.access_token));
    }
    checkGoogleConnection();
  }, []);

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
                userId={HARDCODED_USER_ID}
                isGoogleConnected={isGoogleConnected}
                suggestion={{
                  type: 'recurring',
                  title: 'Morning Yoga',
                  description: '10 min morning yoga',
                  startDateTime: '2025-05-16T09:00:00',
                  endDateTime: '2025-05-16T09:10:00',
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