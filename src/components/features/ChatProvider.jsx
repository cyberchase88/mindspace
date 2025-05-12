'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ChatContext = createContext();

const CHAT_SESSION_KEY = 'mindspace-ai-chat-state';

function loadChatState() {
  if (typeof window === 'undefined') return null;
  try {
    const data = window.sessionStorage.getItem(CHAT_SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function saveChatState(state) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(state));
  } catch {}
}

export function ChatProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  // Load state from sessionStorage on mount
  useEffect(() => {
    const saved = loadChatState();
    if (saved) {
      setIsOpen(saved.isOpen || false);
      setMessages(saved.messages || []);
      setInput(saved.input || '');
    }
  }, []);
  // Persist state on change
  useEffect(() => {
    saveChatState({ isOpen, messages, input });
  }, [isOpen, messages, input]);
  // Real sendMessage: call /api/ai-chat
  const sendMessage = useCallback(async (text, context) => {
    setMessages((msgs) => [...msgs, { role: 'user', text }]);
    setInput('');
    // Show loading indicator
    setMessages((msgs) => [...msgs, { role: 'ai', text: '...', loading: true }]);
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, context }),
      });
      if (!res.ok) throw new Error('Failed to get AI response');
      const data = await res.json();
      setMessages((msgs) => {
        const idx = msgs.findIndex((m) => m.loading);
        if (idx !== -1) {
          const newMsgs = [...msgs];
          newMsgs[idx] = { role: 'ai', text: data.text };
          return newMsgs;
        }
        return msgs;
      });
    } catch (err) {
      setMessages((msgs) => {
        const idx = msgs.findIndex((m) => m.loading);
        if (idx !== -1) {
          const newMsgs = [...msgs];
          newMsgs[idx] = { role: 'ai', text: 'Error: Could not get AI response.' };
          return newMsgs;
        }
        return msgs;
      });
    }
  }, []);
  const value = {
    isOpen,
    setIsOpen,
    messages,
    setMessages,
    input,
    setInput,
    sendMessage,
  };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  return useContext(ChatContext);
} 