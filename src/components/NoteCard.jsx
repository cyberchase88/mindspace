import React, { useState, useEffect } from 'react';
import '../styles/garden-theme.css';

const NoteCard = ({ note, isNew = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMicrocopy, setShowMicrocopy] = useState(isNew);

  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => {
        setShowMicrocopy(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  const getGrowthState = () => {
    const noteAge = Date.now() - new Date(note.createdAt).getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    
    if (noteAge < oneDay) return 'seedling';
    if (noteAge < 7 * oneDay) return 'sprouting';
    return 'blooming';
  };

  const getGrowthIcon = (state) => {
    switch (state) {
      case 'seedling':
        return '🌱';
      case 'sprouting':
        return '🌿';
      case 'blooming':
        return '🌸';
      default:
        return '🌱';
    }
  };

  const getMicrocopy = (state) => {
    switch (state) {
      case 'seedling':
        return 'A new seedling has been planted!';
      case 'sprouting':
        return 'Your thought is growing...';
      case 'blooming':
        return 'Your idea has bloomed!';
      default:
        return '';
    }
  };

  const growthState = getGrowthState();

  return (
    <div
      className={`note-card note-${growthState}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        animation: isNew ? 'grow 0.5s ease-out' : 'none',
        transform: isHovered ? 'translateY(-4px) rotate(1deg)' : 'none',
        transition: 'transform 0.3s ease-out'
      }}
    >
      <div className="note-header">
        <span className="growth-icon" style={{ marginRight: '8px' }}>
          {getGrowthIcon(growthState)}
        </span>
        <h3 className="garden-title">{note.title}</h3>
      </div>
      
      <div className="garden-text">
        {note.content}
      </div>

      {showMicrocopy && (
        <div 
          className="garden-microcopy"
          style={{
            animation: 'fadeIn 0.5s ease-out',
            opacity: showMicrocopy ? 1 : 0
          }}
        >
          {getMicrocopy(growthState)}
        </div>
      )}

      <style jsx>{`
        .note-card {
          margin: var(--garden-spacing-medium);
          padding: var(--garden-spacing-medium);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          position: relative;
          overflow: hidden;
        }

        .note-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--garden-primary);
          opacity: 0.3;
          transition: opacity 0.3s ease;
        }

        .note-card:hover::before {
          opacity: 0.6;
        }

        .note-header {
          display: flex;
          align-items: center;
          margin-bottom: var(--garden-spacing-small);
        }

        .growth-icon {
          font-size: 1.2rem;
          animation: ${isHovered ? 'leafWave 2s infinite' : 'none'};
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default NoteCard; 