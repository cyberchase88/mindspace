'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, getBacklinksForNote, getNoteById } from '@/lib/supabase';
import styles from './note.module.scss';
import DOMPurify from 'dompurify';
import MarkdownRenderer from '@/components/MarkdownRenderer';

export default function NoteDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [backlinks, setBacklinks] = useState([]);
  const [backlinkNotes, setBacklinkNotes] = useState([]);

  useEffect(() => {
    async function fetchNote() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        setError(error.message);
      } else {
        setNote(data);
        setEditedTitle(data.title);
        setEditedContent(data.content);
      }
      setLoading(false);
    }
    if (id) fetchNote();
  }, [id]);

  useEffect(() => {
    async function fetchBacklinks() {
      if (!id) return;
      try {
        const links = await getBacklinksForNote(id);
        setBacklinks(links);
        // Fetch all source notes in parallel
        const notes = await Promise.all(
          links.map(async (link) => {
            try {
              const note = await getNoteById(link.source_note_id);
              return note;
            } catch {
              return null;
            }
          })
        );
        setBacklinkNotes(notes.filter(Boolean));
      } catch (err) {
        // Optionally handle error
        setBacklinks([]);
        setBacklinkNotes([]);
      }
    }
    fetchBacklinks();
  }, [id, note]);

  useEffect(() => {
    const handler = (e) => {
      if (e.target.matches('.wiki-link-node')) {
        e.preventDefault();
        router.push(e.target.getAttribute('href'));
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('notes')
        .update({ title: editedTitle, content: editedContent })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setNote(data);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    setIsDeleting(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      router.push('/');
    } catch (err) {
      setError(err.message);
      setIsDeleting(false);
    }
  };

  const uniqueBacklinks = Array.from(new Map(backlinkNotes.map(note => [note.id, note])).values());

  if (loading) return <div className={styles.pageBg}><div className={styles.container}>Loading...</div></div>;
  if (error) return <div className={styles.pageBg}><div className={styles.container} style={{ color: 'red' }}>Error: {error}</div></div>;
  if (!note) return <div className={styles.pageBg}><div className={styles.container}>Note not found.</div></div>;

  return (
    <div className={styles.pageBg}>
      <div className={styles.container}>
        <header className={styles.header}>
          <Link href="/" className={styles.backButton}>
            ← Back to Notes
          </Link>
          {isEditing ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className={styles.titleInput}
              placeholder="Note title..."
            />
          ) : (
            <h1 className={styles.title}>{note.title}</h1>
          )}
          <div className={styles.actions}>
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={styles.saveButton}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEdit}
                  className={styles.editButton}
                >
                  Edit Note
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className={styles.deleteButton}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Note'}
                </button>
              </>
            )}
          </div>
        </header>
        <div className={styles.content}>
          {isEditing ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className={styles.contentInput}
              placeholder="Note content..."
            />
          ) : (
            <div className={styles.noteContent}>
              <MarkdownRenderer content={note.content || 'No content yet.'} />
            </div>
          )}
          <div className={styles.metadata}>
            Created: {new Date(note.created_at).toLocaleString()}
            {note.updated_at && note.updated_at !== note.created_at && (
              <> • Updated: {new Date(note.updated_at).toLocaleString()}</>
            )}
          </div>
        </div>
        {/* Backlinks Section */}
        {backlinkNotes.length > 0 && (
          <div className={styles.backlinksSection}>
            <h3>Backlinks</h3>
            <ul>
              {uniqueBacklinks.map((blNote) => (
                <li key={blNote.id}>
                  <Link href={`/notes/${blNote.id}`}>{blNote.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 