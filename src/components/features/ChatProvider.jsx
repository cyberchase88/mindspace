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
      // Prepare last 5 turns (user+ai pairs, or as many as available)
      const msgs = messages.concat([{ role: 'user', text }]);
      // Only include messages with role 'user' or 'ai' (ignore loading, etc.)
      const filtered = msgs.filter(m => m.role === 'user' || m.role === 'ai');
      // Group into turns: each user message + following ai message
      const turns = [];
      for (let i = 0; i < filtered.length; i++) {
        if (filtered[i].role === 'user') {
          const userMsg = filtered[i];
          const aiMsg = filtered[i+1] && filtered[i+1].role === 'ai' ? filtered[i+1] : null;
          turns.push({ user: userMsg.text, ai: aiMsg ? aiMsg.text : null });
        }
      }
      const last5 = turns.slice(-5);
      const history = last5.map(turn => [
        { role: 'user', content: turn.user },
        ...(turn.ai ? [{ role: 'assistant', content: turn.ai }] : [])
      ]).flat();
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, context, history }),
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
  }, [messages]);
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