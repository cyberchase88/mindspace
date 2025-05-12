'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TipTapEditor from '@/components/common/TipTapEditor';
import { supabase, createNoteLink, getNoteLinksForNote } from '@/lib/supabase';
import styles from './new.module.scss';
import pageStyles from '../../page.module.scss';

const AUTO_SAVE_DELAY = 2000; // 2 seconds

// Helper: Find or create a note by title, returns the note object
async function findOrCreateNoteByTitle(title) {
  // Try to find the note
  const { data: notes, error } = await supabase
    .from('notes')
    .select('*')
    .eq('title', title)
    .limit(1);
  if (error) throw error;
  if (notes && notes.length > 0) return notes[0];
  // If not found, create it
  const { data: newNote, error: createError } = await supabase
    .from('notes')
    .insert([{ title, content: '' }])
    .select()
    .single();
  if (createError) throw createError;
  return newNote;
}

// Helper: Parse [[Note Title]] patterns
function extractNoteLinks(text) {
  const regex = /\[\[([^\]]+)\]\]/g;
  const matches = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push(match[1].trim());
  }
  return Array.from(new Set(matches)); // deduplicate
}

export default function NewNotePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [noteId, setNoteId] = useState(null); // Track note id
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const saveNote = useCallback(async (processLinks = false) => {
    if (!title.trim()) {
      setError('Please enter a title');
      setSuccess(false);
      console.error('Save failed: No title');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(false);
    console.log('Attempting to save note:', { title, content, noteId });

    try {
      let data, error;
      if (noteId) {
        // Update existing note
        ({ data, error } = await supabase
          .from('notes')
          .update({ title, content })
          .eq('id', noteId)
          .select()
          .single());
      } else {
        // Insert new note
        ({ data, error } = await supabase
          .from('notes')
          .insert([{ title, content }])
          .select()
          .single());
      }

      if (error) {
        setError(error.message);
        setSuccess(false);
        console.error('Supabase save error:', error);
        return;
      }

      setNoteId(data.id); // Store id after first save
      setLastSaved(new Date());
      setSuccess(true);
      console.log('Note saved successfully:', data);

      // Only process links if requested (manual save)
      if (processLinks) {
        const noteIdToUse = data.id;
        const links = extractNoteLinks(content);
        for (const linkTitle of links) {
          try {
            const targetNote = await findOrCreateNoteByTitle(linkTitle);
            await createNoteLink(noteIdToUse, targetNote.id, `[[${linkTitle}]]`);
          } catch (err) {
            console.error(`Error processing link for [[${linkTitle}]]:`, err);
          }
        }
      }
    } catch (err) {
      setError(err.message);
      setSuccess(false);
      console.error('Unexpected error saving note:', err);
    } finally {
      setIsSaving(false);
    }
  }, [title, content, noteId]);

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
      // Cmd/Ctrl + S to save and process links
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveNote(true);
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
            onClick={() => saveNote(true)}
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