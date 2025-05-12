'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/context/AuthContext';

const ChatContext = createContext();

const CHAT_SESSION_KEY = 'mindspace-ai-chat-state';
const DEVICE_ID_KEY = 'mindspace-device-id';

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

function getOrCreateDeviceId() {
  if (typeof window === 'undefined') return null;
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function ChatProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const { user } = useAuth ? useAuth() : { user: null };
  const [loadingHistory, setLoadingHistory] = useState(true);
  const deviceId = typeof window !== 'undefined' ? getOrCreateDeviceId() : null;

  // Fetch chat history on mount or when user/device changes
  useEffect(() => {
    async function fetchHistory() {
      setLoadingHistory(true);
      let url = '/api/chat/history';
      let headers = {};
      if (user && user.id) {
        headers['x-user-id'] = user.id;
      } else if (deviceId) {
        url += `?device_id=${deviceId}`;
      }
      try {
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error('Failed to fetch chat history');
        const data = await res.json();
        setMessages((data.messages || []).map(m => ({ role: m.role === 'ai' ? 'ai' : 'user', text: m.content })));
      } catch {
        setMessages([]);
      } finally {
        setLoadingHistory(false);
      }
    }
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, deviceId]);

  // Persist state on change (for UI only)
  useEffect(() => {
    saveChatState({ isOpen, messages, input });
  }, [isOpen, messages, input]);

  // Save message to backend
  const saveMessage = async (role, text) => {
    const payload = {
      role,
      content: text,
      user_id: user && user.id ? user.id : undefined,
      device_id: !user || !user.id ? deviceId : undefined,
    };
    await fetch('/api/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  };

  // Real sendMessage: call /api/ai-chat and save messages
  const sendMessage = useCallback(async (text, context) => {
    setMessages((msgs) => [...msgs, { role: 'user', text }]);
    setInput('');
    await saveMessage('user', text);
    // Show loading indicator
    setMessages((msgs) => [...msgs, { role: 'ai', text: '...', loading: true }]);
    try {
      // Prepare last 5 turns (user+ai pairs, or as many as available)
      const msgs = messages.concat([{ role: 'user', text }]);
      const filtered = msgs.filter(m => m.role === 'user' || m.role === 'ai');
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
      await saveMessage('ai', data.text);
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
      await saveMessage('ai', 'Error: Could not get AI response.');
    }
  }, [messages, user, deviceId]);

  const value = {
    isOpen,
    setIsOpen,
    messages,
    setMessages,
    input,
    setInput,
    sendMessage,
    loadingHistory,
  };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  return useContext(ChatContext);
} 