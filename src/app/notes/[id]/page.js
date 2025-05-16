'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, getBacklinksForNote, getNoteById, getStaticUserId } from '@/lib/supabase';
import styles from './note.module.scss';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { useNote } from '@/lib/context/NoteContext';
import TipTapEditor from '@/components/common/TipTapEditor';
import { calculateNextReview } from '@/lib/spacedRepetition';
import AddToGoogleCalendarButton from '@/components/features/AddToGoogleCalendarButton';

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
  const { setCurrentNote } = useNote();
  const [spacedRepetition, setSpacedRepetition] = useState(null);
  const [remembered, setRemembered] = useState(false);
  const [srLoading, setSrLoading] = useState(true);
  const [srError, setSrError] = useState(null);
  const [eventSuggestion, setEventSuggestion] = useState(null);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [suggestionError, setSuggestionError] = useState(null);

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
  }, [router]);

  useEffect(() => {
    if (note) setCurrentNote(note);
  }, [note, setCurrentNote]);

  // Fetch spaced repetition state for this note
  useEffect(() => {
    async function fetchSR() {
      setSrLoading(true);
      setSrError(null);
      try {
        const userId = getStaticUserId();
        const res = await fetch(`/api/spaced-repetition/is-remembered?noteId=${id}&userId=${userId}`);
        const data = await res.json();
        setRemembered(!!data.remembered);
        setSpacedRepetition(data.spacedRepetition);
      } catch (err) {
        setSrError('Failed to load spaced repetition state');
      } finally {
        setSrLoading(false);
      }
    }
    if (id) fetchSR();
  }, [id]);

  useEffect(() => {
    async function fetchSuggestion() {
      if (!note) return;
      setSuggestionLoading(true);
      setSuggestionError(null);
      try {
        const res = await fetch('/api/ai-questions/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: note.title, content: note.content })
        });
        const data = await res.json();
        setEventSuggestion(data.suggestion || null);
      } catch (err) {
        setSuggestionError('Could not fetch suggestion');
        setEventSuggestion(null);
      } finally {
        setSuggestionLoading(false);
      }
    }
    if (note) fetchSuggestion();
  }, [note]);

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
          <Link href="/notes" className={styles.backButton}>
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
            <TipTapEditor
              content={editedContent}
              onChange={setEditedContent}
              placeholder="Edit your note..."
              saveNote={handleSave}
            />
          ) : (
            <div
              className={styles.noteContent}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(marked(note.content || 'No content yet.')),
              }}
            />
          )}
          <div className={styles.metadata}>
            Created: {new Date(note.created_at).toLocaleString()}
            {note.updated_at && note.updated_at !== note.created_at && (
              <> • Updated: {new Date(note.updated_at).toLocaleString()}</>
            )}
          </div>

          {/* Spaced Repetition Forecast Section */}
          <div className={styles.srForecastCard}>
            <h2 style={{ marginBottom: 8, fontSize: 20 }}>Spaced Repetition Forecast</h2>
            {srLoading ? (
              <div>Loading spaced repetition info...</div>
            ) : srError ? (
              <div style={{ color: 'red' }}>{srError}</div>
            ) : !remembered ? (
              <div>
                <p>This note is not in your spaced repetition queue.</p>
                {/* Optionally, add a button to enable spaced repetition here */}
              </div>
            ) : spacedRepetition ? (
              <SRForecast spacedRepetition={spacedRepetition} />
            ) : null}
          </div>

          {/* Event Suggestion Section */}
          {suggestionLoading ? (
            <div>Loading event suggestion...</div>
          ) : eventSuggestion ? (
            <div style={{ margin: '16px 0' }}>
              <AddToGoogleCalendarButton
                userId={getStaticUserId()}
                isGoogleConnected={true} // TODO: wire up real auth state
                suggestion={eventSuggestion.suggestion}
                suggestionType={eventSuggestion.type}
                defaultRecurrence={eventSuggestion.defaultRecurrence}
                defaultTime={eventSuggestion.defaultTime}
              />
            </div>
          ) : suggestionError ? (
            <div style={{ color: 'red' }}>{suggestionError}</div>
          ) : null}
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

function SRForecast({ spacedRepetition }) {
  // Simulate N future reviews (e.g., 10), assuming quality=4 each time
  const N = 20; // Simulate more steps to ensure we cover up to 1 year
  const forecast = [];
  let { interval_days, difficulty, next_review_at } = spacedRepetition;
  const today = new Date();
  let date = new Date(next_review_at);
  if (date < today) {
    // If next_review_at is in the past, start from today
    date = new Date(today);
  }
  const oneYearFromNow = new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000);
  for (let i = 0; i < N; i++) {
    if (date > oneYearFromNow) break;
    forecast.push({
      reviewNumber: i + 1,
      date: new Date(date),
      interval: interval_days,
      difficulty: difficulty,
    });
    // Simulate next review (quality=4)
    const { nextInterval, nextDifficulty } = calculateNextReview(interval_days, difficulty, 4);
    interval_days = nextInterval;
    difficulty = nextDifficulty;
    date = new Date(date.getTime() + interval_days * 24 * 60 * 60 * 1000);
  }
  const progress = Math.min(1, Math.max(0, (today - new Date(spacedRepetition.added_at)) / (oneYearFromNow - new Date(spacedRepetition.added_at))));
  const progressPercent = Math.round(progress * 100);
  const estMasteryDate = forecast.length > 0 ? forecast[forecast.length - 1].date : null;
  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <b>Next review:</b> {new Date(spacedRepetition.next_review_at).toLocaleDateString()} ({spacedRepetition.interval_days} days)
      </div>
      <div style={{ marginBottom: 8 }}>
        <b>Forecast (next 1 year):</b>
        <ul style={{ margin: '8px 0 0 16px', padding: 0 }}>
          {forecast.map(f => (
            <li key={f.reviewNumber}>
              Review {f.reviewNumber}: {f.date.toLocaleDateString()} (interval: {f.interval} days, difficulty: {f.difficulty.toFixed(2)})
            </li>
          ))}
        </ul>
        <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
          *Only reviews scheduled within the next 1 year (365 days) are shown. The underlying SM-2 algorithm is unmodified.
        </div>
      </div>
      <div style={{ margin: '12px 0' }}>
        <b>Last forecasted review date (within 1 year):</b> {estMasteryDate ? estMasteryDate.toLocaleDateString() : 'N/A'}
      </div>
      <div style={{ margin: '12px 0' }}>
        <b>Progress:</b> {progressPercent}% toward 1 year of review history
        <div style={{ background: '#e0e0e0', borderRadius: 6, height: 8, width: 240, overflow: 'hidden', marginTop: 4 }}>
          <div style={{ background: '#00C853 !important', width: `${progressPercent}%`, height: '100%' }} />
        </div>
      </div>
    </div>
  );
} 