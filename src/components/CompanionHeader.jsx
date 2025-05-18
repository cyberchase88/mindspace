'use client';
import { useChat } from '@/components/features/ChatProvider';
import React from 'react';

export default function CompanionHeader() {
  const { isOpen, setIsOpen } = useChat();
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 1200,
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: 0,
      }}
    >
      <button
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close Companion Mode' : 'Open Companion Mode'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'linear-gradient(90deg, #b7e4c7 0%, #95d5b2 100%)',
          color: '#207520',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: 600,
          padding: '0.5rem 1.1rem',
          cursor: 'pointer',
          boxShadow: '0 2px 8px 0 rgba(120,200,180,0.08)',
          transition: 'all 0.2s',
          pointerEvents: 'auto',
        }}
      >
        <span aria-hidden="true" style={{ fontSize: '1.2rem' }}>💬</span>
        <span>Companion Mode</span>
      </button>
    </div>
  );
} 