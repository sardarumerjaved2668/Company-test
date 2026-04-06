import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';
import { fetchCurrentChat, appendMessages, clearCurrentChat } from '../services/chatService';

const LOCAL_KEY = 'nexusai-chat-hub-messages';
const MAX_STORED = 300;

function sanitizeMessages(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((m) => m && (m.role === 'user' || m.role === 'bot') && typeof m.text === 'string')
    .map((m, i) => ({ id: typeof m.id === 'number' ? m.id : Date.now() + i, role: m.role, text: m.text }))
    .slice(-MAX_STORED);
}

// ── localStorage helpers ───────────────────────────────────────
function readLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? sanitizeMessages(JSON.parse(raw)) : [];
  } catch { return []; }
}

function writeLocal(msgs) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(msgs.slice(-MAX_STORED))); } catch { /* quota */ }
}

function clearLocal() {
  try { localStorage.removeItem(LOCAL_KEY); } catch { /* ignore */ }
}

/**
 * Persists the Chat Hub thread:
 *  - Authenticated users: backend API (Chat collection, per-user)
 *  - Unauthenticated: localStorage fallback
 */
export function useChatHubPersistence() {
  const { user } = useAuth();
  const isAuth = Boolean(user);

  const [messages, setMessages] = useState([]);
  const [ready, setReady] = useState(false);
  // Track which new messages need to be flushed to the backend
  const pendingFlushRef = useRef([]);
  const flushTimerRef = useRef(null);

  // ── Bootstrap: load messages on mount / auth change ───────────
  useEffect(() => {
    let cancelled = false;
    setReady(false);

    async function load() {
      if (isAuth) {
        try {
          const chat = await fetchCurrentChat();
          if (!cancelled) {
            setMessages(sanitizeMessages(chat.messages || []));
          }
        } catch {
          // Backend error — fall back to local
          if (!cancelled) setMessages(readLocal());
        }
      } else {
        if (!cancelled) setMessages(readLocal());
      }
      if (!cancelled) setReady(true);
    }

    load();
    return () => { cancelled = true; };
  }, [isAuth]);

  // ── Persist to localStorage for unauthenticated users ─────────
  useEffect(() => {
    if (!ready || isAuth) return;
    writeLocal(messages);
  }, [messages, ready, isAuth]);

  // ── Flush new messages to backend (debounced) ─────────────────
  const flushToBackend = useCallback((newMsgs) => {
    if (!isAuth || newMsgs.length === 0) return;
    pendingFlushRef.current.push(...newMsgs);
    clearTimeout(flushTimerRef.current);
    flushTimerRef.current = setTimeout(async () => {
      const toSend = pendingFlushRef.current;
      pendingFlushRef.current = [];
      if (toSend.length === 0) return;
      try {
        await appendMessages(toSend);
      } catch { /* non-critical — messages already in local state */ }
    }, 400);
  }, [isAuth]);

  // ── setChatMessages wrapper that intercepts new messages ───────
  const setChatMessages = useCallback((updater) => {
    setMessages((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      // Detect newly appended messages to flush
      const added = next.slice(prev.length);
      if (added.length > 0) flushToBackend(added);
      return next;
    });
  }, [flushToBackend]);

  // ── Clear chat ────────────────────────────────────────────────
  const clearChat = useCallback(async () => {
    setMessages([]);
    if (isAuth) {
      try { await clearCurrentChat(); } catch { /* non-critical */ }
    } else {
      clearLocal();
    }
  }, [isAuth]);

  return { chatMessages: messages, setChatMessages, persistenceReady: ready, clearChat };
}
