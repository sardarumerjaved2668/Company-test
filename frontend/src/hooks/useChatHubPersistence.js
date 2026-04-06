import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'nexusai-chat-hub-messages';
/** Keep last N messages so localStorage stays small */
const MAX_STORED = 300;

function sanitizeMessages(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (m) =>
        m &&
        typeof m === 'object' &&
        (m.role === 'user' || m.role === 'bot') &&
        typeof m.text === 'string'
    )
    .map((m, i) => ({
      id: typeof m.id === 'number' ? m.id : Date.now() + i,
      role: m.role,
      text: m.text,
    }))
    .slice(-MAX_STORED);
}

/**
 * Load/save Chat Hub thread in localStorage (per browser profile).
 */
export function useChatHubPersistence() {
  const [messages, setMessages] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setMessages(sanitizeMessages(parsed));
      }
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      const trimmed = messages.slice(-MAX_STORED);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      /* quota or private mode */
    }
  }, [messages, ready]);

  const clearChat = useCallback(() => {
    setMessages([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return { chatMessages: messages, setChatMessages: setMessages, persistenceReady: ready, clearChat };
}
