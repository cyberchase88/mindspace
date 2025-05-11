'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './SidebarView.module.scss';

async function fetchNotes() {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export default function SidebarView() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const { data: notes, isLoading, error } = useQuery({
    queryKey: ['notes'],
    queryFn: fetchNotes,
  });

  const filteredNotes = notes?.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNoteClick = (noteId) => {
    router.push(`/notes/${noteId}`);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className={styles.container}>
      <aside className={`${styles.sidebar} ${isSidebarCollapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <button
            className={styles.collapseButton}
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? '→' : '←'}
          </button>
          {!isSidebarCollapsed && (
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          )}
        </div>
        {!isSidebarCollapsed && (
          <div className={styles.noteList}>
            {filteredNotes?.map((note) => (
              <div
                key={note.id}
                className={styles.noteItem}
                onClick={() => handleNoteClick(note.id)}
              >
                <h3 className={styles.noteTitle}>{note.title}</h3>
              </div>
            ))}
          </div>
        )}
      </aside>
      <main className={styles.mainContent}>
        <div className={styles.emptyState}>
          <p>Select a note to view its content</p>
        </div>
      </main>
    </div>
  );
} 