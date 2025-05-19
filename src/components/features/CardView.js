'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Masonry from 'react-masonry-css';
import styles from './CardView.module.scss';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { useEffect, useState } from 'react';
import CalendarEventModal from '../common/CalendarEventModal';
import { addEventToGoogleCalendar } from '@/lib/addEventToGoogleCalendar';

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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState('');

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
              {/* Subtle calendar icon, only visible on hover */}
              <span
                className={styles.calendarIcon}
                title="Add to Google Calendar"
                onClick={e => {
                  e.preventDefault();
                  setSelectedTitle(note.title);
                  setModalOpen(true);
                }}
                tabIndex={0}
                role="button"
                aria-label="Add to Google Calendar"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ pointerEvents: 'auto' }}>
                  <rect x="3" y="5" width="14" height="12" rx="2" fill="#588157" fillOpacity="0.18"/>
                  <rect x="3" y="5" width="14" height="12" rx="2" stroke="#588157" strokeWidth="1.2"/>
                  <rect x="7" y="9" width="6" height="2" rx="1" fill="#588157" fillOpacity="0.5"/>
                  <rect x="7" y="13" width="6" height="2" rx="1" fill="#588157" fillOpacity="0.3"/>
                  <rect x="6" y="2" width="2" height="4" rx="1" fill="#588157"/>
                  <rect x="12" y="2" width="2" height="4" rx="1" fill="#588157"/>
                </svg>
              </span>
              <div className={styles.cardFooter}>
                <time dateTime={note.created_at}>
                  {new Date(note.created_at).toLocaleDateString()}
                </time>
              </div>
            </article>
          </Link>
        ))}
      </Masonry>
      <CalendarEventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={async ({ title, date, time, recurrence }) => {
          setModalOpen(false);
          if (typeof window !== 'undefined' && !window.sessionStorage.getItem('googleEmail')) {
            alert('Please connect your Google account before adding events.');
            window.location.href = `/settings?returnTo=${encodeURIComponent(window.location.pathname)}`;
            return;
          }
          const result = await addEventToGoogleCalendar({
            userId: HARDCODED_USER_ID,
            title,
            date,
            time,
            recurrence,
            description: '',
          });
          if (result && result.error) {
            alert('Error: ' + result.error);
          } else {
            alert('Event added to Google Calendar!');
          }
        }}
        initialSuggestion={selectedTitle}
        type="one_time_action"
      />
    </div>
  );
} 