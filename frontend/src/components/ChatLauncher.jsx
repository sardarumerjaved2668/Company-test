'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useLocale } from '../context/LocaleContext';

export default function ChatLauncher() {
  const { t, messages } = useLocale();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messagesState, setMessagesState] = useState([]);
  const endRef = useRef(null);

  const suggestions = useMemo(() => messages.chatLauncher?.suggestions || [], [messages]);

  useEffect(() => {
    setMessagesState([
      {
        from: 'bot',
        text: t('chatLauncher.welcomeBot'),
      },
    ]);
  }, [t]);

  useEffect(() => {
    if (open && endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [open, messagesState.length]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setInput('');
    setMessagesState((prev) => [
      ...prev,
      { from: 'user', text: userText },
      {
        from: 'bot',
        text: t('chatLauncher.replyBot'),
      },
    ]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (text) => {
    setInput(text);
  };

  return (
    <>
      <button
        type="button"
        className="chat-fab"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('chatLauncher.fabAria')}
      >
        <span className="chat-fab-icon">💬</span>
        <span className="chat-fab-label">{t('chatLauncher.fabLabel')}</span>
      </button>

      <div className={`chat-panel${open ? ' chat-panel-open' : ''}`} id="chat-hub">
        <div className="chat-panel-header">
          <div>
            <div className="chat-panel-title">{t('chatLauncher.title')}</div>
            <div className="chat-panel-sub">
              {t('chatLauncher.subtitle')}
            </div>
          </div>
          <button
            type="button"
            className="chat-panel-close"
            onClick={() => setOpen(false)}
            aria-label={t('chatLauncher.closeAria')}
          >
            ×
          </button>
        </div>

        <div className="chat-panel-body">
          <div className="chat-messages">
            {messagesState.map((m, i) => (
              <div
                key={`${m.from}-${i}-${m.text.slice(0, 12)}`}
                className={`chat-message chat-message-${m.from}`}
              >
                {m.text}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="chat-suggestions">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                className="chat-suggestion-pill"
                onClick={() => handleSuggestion(s)}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="chat-input-row">
            <textarea
              className="chat-input"
              rows={2}
              placeholder={t('chatLauncher.placeholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              className="chat-send-btn"
              onClick={handleSend}
            >
              {t('chatLauncher.send')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
