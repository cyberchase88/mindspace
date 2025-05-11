'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TipTapEditor from '@/components/common/TipTapEditor';
import { supabase } from '@/lib/supabase';
import styles from './new.module.scss';
import pageStyles from '../../page.module.scss';

const AUTO_SAVE_DELAY = 2000; // 2 seconds

export default function NewNotePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const saveNote = useCallback(async () => {
    if (!title.trim()) {
      setError('Please enter a title');
      setSuccess(false);
      console.error('Save failed: No title');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(false);
    console.log('Attempting to save note:', { title, content });

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{ title, content }])
        .select()
        .single();

      if (error) {
        setError(error.message);
        setSuccess(false);
        console.error('Supabase insert error:', error);
        return;
      }

      setLastSaved(new Date());
      setSuccess(true);
      console.log('Note saved successfully:', data);
    } catch (err) {
      setError(err.message);
      setSuccess(false);
      console.error('Unexpected error saving note:', err);
    } finally {
      setIsSaving(false);
    }
  }, [title, content]);

  // Auto-save effect
  useEffect(() => {
    if (!title.trim()) return;

    const timeoutId = setTimeout(() => {
      saveNote();
    }, AUTO_SAVE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [title, content, saveNote]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveNote();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [saveNote]);

  return (
    <div className={pageStyles.homePage}>
      <header className={pageStyles.gardenHeader} style={{ marginBottom: '2rem' }}>
        <Link href="/" className={styles.backButton}>
          ← Back to Notes
        </Link>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          className={styles.titleInput}
          style={{
            fontSize: '2rem',
            margin: '1rem auto',
            display: 'block',
            textAlign: 'center',
            background: 'transparent',
            border: 'none',
            fontWeight: 700,
            color: '#3a5a40',
            outline: 'none',
            width: '100%',
            maxWidth: 600
          }}
        />
        <div className={styles.actions} style={{ justifyContent: 'center', margin: '1rem 0' }}>
          <button
            onClick={saveNote}
            disabled={isSaving}
            className={styles.saveButton}
            title="Save Note (⌘S)"
          >
            {isSaving ? 'Saving...' : 'Save Note'}
          </button>
        </div>
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>Note saved successfully!</div>}
        {lastSaved && (
          <div className={styles.lastSaved}>
            Last saved: {lastSaved.toLocaleTimeString()}
          </div>
        )}
      </header>
      <div className={styles.editor}>
        <TipTapEditor
          content={content}
          onChange={setContent}
          placeholder="Start writing your note..."
        />
      </div>
    </div>
  );
} 