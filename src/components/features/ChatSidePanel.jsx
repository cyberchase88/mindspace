'use client';
import React, { useRef, useEffect } from 'react';
import { useChat } from './ChatProvider';
import { useNote } from '@/lib/context/NoteContext';
import styles from './ChatSidePanel.module.scss';
import MarkdownRenderer from '../MarkdownRenderer';

// ---
// ChatSidePanel.jsx
//
// This component implements a right-side AI chat panel with resizable width.
// The panel can be resized by dragging the handle on its left edge.
// Dragging left expands the panel, dragging right shrinks it.
// Width is clamped between 320px and 700px for usability.
// Event listeners are attached to window for robust handling, including edge cases
// like rapid dragging or releasing the mouse outside the window.
// The .resizing class is toggled for visual feedback during resizing.
// ---

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
    // ---
    // onMouseDown: Start resizing, record initial mouse X and panel width.
    // Add .resizing class and disable text selection for UX.
    // ---
    function onMouseDown(e) {
      console.log('ChatSidePanel: onMouseDown fired', e);
      window._testChatPanelResize = true; // For quick test/debugging
      startX = e.clientX;
      startWidth = panel.offsetWidth;
      document.body.style.userSelect = 'none';
      panel.classList.add(styles.resizing);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    // ---
    // onMouseMove: Calculate new width so that dragging left expands and right shrinks.
    // Clamp width between 320px and 700px.
    // ---
    function onMouseMove(e) {
      const newWidth = Math.max(320, Math.min(700, startWidth + (startX - e.clientX)));
      panel.style.width = newWidth + 'px';
    }
    // ---
    // onMouseUp: End resizing, clean up event listeners and restore state.
    // Handles edge cases where mouse is released outside the window.
    // ---
    function onMouseUp() {
      document.body.style.userSelect = '';
      panel.classList.remove(styles.resizing);
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