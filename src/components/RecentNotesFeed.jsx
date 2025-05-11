"use client";
import React from 'react';
import '../styles/garden-theme.css';

const RecentNotesFeed = ({ notes }) => {
  const recentNotes = notes.slice(0, 5); // Show last 5 notes

  return (
    <div className="recent-notes-feed">
      <h2 className="recent-notes-title">
        <span className="title-icon">🌱</span> Recent Thoughts
      </h2>
      <div className="recent-notes-scroll">
        {recentNotes.map((note, index) => (
          <div 
            key={note.id} 
            className="recent-note-card"
            style={{
              animationDelay: `${index * 0.1}s`
            }}
          >
            <div className="recent-note-content">
              <h3 className="recent-note-title">{note.title}</h3>
              <p className="recent-note-preview">
                {note.content.substring(0, 60)}...
              </p>
            </div>
            <div className="recent-note-meta">
              <span className="recent-note-date">
                {new Date(note.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .recent-notes-feed {
          margin: var(--garden-spacing-large) 0;
          padding: var(--garden-spacing-medium);
          background: rgba(255, 255, 255, 0.5);
          border-radius: 16px;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .recent-notes-title {
          font-family: 'Cormorant Garamond', serif;
          color: var(--garden-text);
          font-size: 1.5rem;
          margin-bottom: var(--garden-spacing-medium);
          display: flex;
          align-items: center;
          gap: var(--garden-spacing-small);
        }

        .title-icon {
          font-size: 1.2rem;
          animation: leafWave 2s infinite;
        }

        .recent-notes-scroll {
          display: flex;
          gap: var(--garden-spacing-medium);
          overflow-x: auto;
          padding: var(--garden-spacing-small) 0;
          scrollbar-width: thin;
          scrollbar-color: var(--garden-primary) transparent;
        }

        .recent-notes-scroll::-webkit-scrollbar {
          height: 6px;
        }

        .recent-notes-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .recent-notes-scroll::-webkit-scrollbar-thumb {
          background-color: var(--garden-primary);
          border-radius: 3px;
        }

        .recent-note-card {
          min-width: 280px;
          padding: var(--garden-spacing-medium);
          background: rgba(255, 255, 255, 0.9);
          border-radius: 12px;
          box-shadow: var(--garden-shadow-sm);
          transition: all var(--garden-transition-medium);
          animation: slideIn 0.5s ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .recent-note-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--garden-shadow-md);
        }

        .recent-note-title {
          font-family: 'Cormorant Garamond', serif;
          color: var(--garden-text);
          font-size: 1.1rem;
          margin: 0 0 var(--garden-spacing-small) 0;
        }

        .recent-note-preview {
          font-family: 'Inter', sans-serif;
          color: var(--garden-text-light);
          font-size: 0.9rem;
          line-height: 1.4;
          margin: 0;
        }

        .recent-note-meta {
          margin-top: var(--garden-spacing-small);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .recent-note-date {
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          color: var(--garden-text-light);
          opacity: 0.8;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default RecentNotesFeed; 