'use client';
import React, { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import styles from './NotesList.module.scss'; // Reuse for card style

const RATINGS = [
  { value: 0, label: 'Blackout' },
  { value: 1, label: 'Failed' },
  { value: 2, label: 'Difficult' },
  { value: 3, label: 'Moderate' },
  { value: 4, label: 'Good' },
  { value: 5, label: 'Perfect' },
];

/**
 * ReviewNoteCard
 * Props:
 *   - note: { title, content }
 *   - onShowAnswer: function (optional)
 *   - onRate: function (optional)
 */
export default function ReviewNoteCard({ note, onShowAnswer, onRate }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const cardRef = useRef(null);

  useEffect(() => {
    setShowAnswer(false); // Reset when note changes
    setSelectedRating(null);
  }, [note]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (!showAnswer && (e.code === 'Space' || e.key === ' ')) {
        setShowAnswer(true);
        if (onShowAnswer) onShowAnswer();
      }
      if (showAnswer && e.key >= '0' && e.key <= '5') {
        const rating = parseInt(e.key, 10);
        setSelectedRating(rating);
        if (onRate) onRate(rating);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAnswer, onShowAnswer, onRate]);

  return (
    <div
      className={styles.noteCard}
      ref={cardRef}
      style={{
        minHeight: 180,
        maxWidth: 420,
        margin: '0 auto',
        transition: 'box-shadow 0.3s, transform 0.3s',
        boxShadow: showAnswer ? '0 8px 32px rgba(120, 200, 180, 0.18)' : undefined,
      }}
    >
      <h3 style={{ marginBottom: 16 }}>{note.title}</h3>
      {!showAnswer ? (
        <button
          onClick={() => {
            setShowAnswer(true);
            if (onShowAnswer) onShowAnswer();
          }}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(90deg, #b7e4c7 0%, #fceabb 100%)',
            color: '#3a5a40',
            borderRadius: 8,
            fontWeight: 600,
            border: 'none',
            fontSize: '1.1rem',
            cursor: 'pointer',
            margin: '1rem 0',
            boxShadow: '0 2px 8px 0 rgba(120,200,180,0.08)',
            transition: 'all 0.3s ease',
          }}
        >
          Show Answer
        </button>
      ) : (
        <>
          <div
            className={styles.preview}
            style={{
              marginTop: 12,
              animation: 'fadeIn 0.5s ease-out',
              color: '#588157',
              fontSize: '1.05rem',
              lineHeight: 1.6,
            }}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(marked(note.content || '')),
            }}
          />
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: '#3a5a40', marginBottom: 8 }}>How well did you recall?</span>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              {RATINGS.map(({ value, label }) => (
                <button
                  key={value}
                  aria-label={`Rate recall: ${value} - ${label}`}
                  onClick={() => {
                    setSelectedRating(value);
                    if (onRate) onRate(value);
                  }}
                  style={{
                    padding: '0.7rem 0.9rem',
                    borderRadius: 18,
                    border: selectedRating === value ? '2.5px solid #95d5b2' : '1.5px solid #b7e4c7',
                    background: selectedRating === value
                      ? 'linear-gradient(90deg, #b7e4c7 0%, #fceabb 100%)'
                      : 'linear-gradient(90deg, #f3ffe3 0%, #e0f7fa 100%)',
                    color: selectedRating === value ? '#3a5a40' : '#588157',
                    fontWeight: 600,
                    fontSize: '1.05rem',
                    minWidth: 54,
                    margin: '0 2px',
                    outline: 'none',
                    cursor: 'pointer',
                    boxShadow: selectedRating === value ? '0 2px 8px 0 rgba(120,200,180,0.12)' : 'none',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                  tabIndex={0}
                >
                  <span style={{ fontSize: '1.15rem', fontWeight: 700 }}>{value}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{label}</span>
                </button>
              ))}
            </div>
            {selectedRating !== null && (
              <div style={{ marginTop: 10, color: '#588157', fontWeight: 500 }}>
                You rated: <b>{selectedRating} – {RATINGS[selectedRating].label}</b>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
} 