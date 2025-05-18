'use client';
import React from 'react';
import { useChat } from './ChatProvider';
import styles from './FloatingChatButton.module.scss';

export default function FloatingChatButton() {
  const { isOpen, setIsOpen } = useChat();
  return (
    <button
      className={styles.floatingButton}
      aria-label={isOpen ? 'Close Companion Mode' : 'Open Companion Mode'}
      onClick={() => setIsOpen((open) => !open)}
      tabIndex={0}
      type="button"
    >
      <span aria-hidden="true" className={styles.icon}>💬</span>
      <span className={styles.text}>Companion Mode</span>
    </button>
  );
} 