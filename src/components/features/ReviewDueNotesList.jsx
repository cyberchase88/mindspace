import React from 'react';
import styles from './NotesList.module.scss'; // Reuse existing styles for consistency

/**
 * ReviewDueNotesList
 * Displays a list of notes due for spaced repetition review in a card-based grid layout.
 * Props:
 *   - notes: array of note objects (each with at least id, title)
 *   - loading: boolean (optional)
 *   - error: string (optional)
 *   - progress: { current: number, total: number } (optional)
 */
export default function ReviewDueNotesList({ notes = [], loading = false, error = null, progress = null }) {
  // TODO: Integrate API fetching and progress logic in next subtasks

  if (loading) {
    return <div className={styles.loading}>Loading due notes...</div>;
  }
  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }
  if (!notes.length) {
    return (
      <div className={styles.empty}>
        <p>No notes are due for review! 🌱</p>
      </div>
    );
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.header}>
        <h2>Spaced Repetition Review</h2>
        <div>
          {progress ? (
            <span>
              Progress: {progress.current} / {progress.total}
            </span>
          ) : (
            <span>Total Due: {notes.length}</span>
          )}
        </div>
      </div>
      <div className={styles.notesList}>
        {/* Card grid layout */}
        <div className={styles.masonryGrid}>
          {notes.map((note) => (
            <div key={note.id} className={styles.noteCard}>
              <h3>{note.title}</h3>
              {/* Only show title/question for now */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 