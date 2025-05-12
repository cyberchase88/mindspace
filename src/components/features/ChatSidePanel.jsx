'use client';
import React, { useRef, useEffect } from 'react';
import { useChat } from './ChatProvider';
import { useNote } from '@/lib/context/NoteContext';
import styles from './ChatSidePanel.module.scss';
import MarkdownRenderer from '../MarkdownRenderer';

export default function ChatSidePanel() {
  const { isOpen, setIsOpen, messages, input, setInput, sendMessage } = useChat();
  const { currentNote } = useNote();
  const panelRef = useRef(null);
  const dragRef = useRef(null);
  const messagesRef = useRef(null); // Ref for messages container

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // Resizing logic
  React.useEffect(() => {
    const panel = panelRef.current;
    const drag = dragRef.current;
    if (!panel || !drag) return;
    let startX, startWidth;
    function onMouseDown(e) {
      startX = e.clientX;
      startWidth = panel.offsetWidth;
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    function onMouseMove(e) {
      const newWidth = Math.max(320, Math.min(700, startWidth - (startX - e.clientX)));
      panel.style.width = newWidth + 'px';
    }
    function onMouseUp() {
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }
    drag.addEventListener('mousedown', onMouseDown);
    return () => {
      drag.removeEventListener('mousedown', onMouseDown);
    };
  }, []);
  // Handle send
  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim()) sendMessage(input, currentNote ? { note: currentNote } : undefined);
  };
  if (!isOpen) return null;
  return (
    <aside className={styles.panel} ref={panelRef} role="dialog" aria-modal="true" tabIndex={-1}>
      <div className={styles.dragHandle} ref={dragRef} aria-label="Resize chat panel" tabIndex={0} />
      <header className={styles.header}>
        <span className={styles.title}>AI Chat Assistant</span>
        <button className={styles.closeBtn} aria-label="Close chat" onClick={() => setIsOpen(false)}>&times;</button>
      </header>
      <div className={styles.messages} ref={messagesRef}>
        {messages.length === 0 && <div className={styles.empty}>No messages yet. Ask me anything!</div>}
        {messages.map((msg, i) => (
          !msg.loading && (
            <div key={i} className={msg.role === 'user' ? styles.userMsg : styles.aiMsg}>
              <MarkdownRenderer content={msg.text} />
            </div>
          )
        ))}
        {/* Typing indicator: show if last message is AI and loading */}
        {messages.length > 0 && messages[messages.length-1].role === 'ai' && messages[messages.length-1].loading && (
          <div className={styles.aiMsg}>
            <div className={styles.typingIndicator}>
              <span className={styles.typingDot}></span>
              <span className={styles.typingDot}></span>
              <span className={styles.typingDot}></span>
            </div>
          </div>
        )}
      </div>
      <form className={styles.inputBar} onSubmit={handleSend}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your question..."
          className={styles.input}
          aria-label="Type your question"
          disabled={messages[messages.length-1]?.loading}
        />
        <button
          type="submit"
          className={styles.sendBtn}
          disabled={!input.trim() || messages[messages.length-1]?.loading}
          aria-label="Send"
        >
          ➤
        </button>
      </form>
    </aside>
  );
} 