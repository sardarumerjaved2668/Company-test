'use client';

import { useState, useRef, useEffect } from 'react';

const SUGGESTIONS = [
  'Help me choose a coding model',
  'I want to generate product images',
  'Recommend a model for long documents',
  'Suggest a budget-friendly model',
];

export default function ChatLauncher() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: "Hi! I'm your guided discovery chat. Tell me what you want to build and I'll suggest which models to explore.",
    },
  ]);
  const endRef = useRef(null);

  useEffect(() => {
    if (open && endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [open, messages.length]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setInput('');
    setMessages((prev) => [
      ...prev,
      { from: 'user', text: userText },
      {
        from: 'bot',
        text:
          "Great! I don't run a live AI model here yet, but based on your message I'll highlight suitable models in the recommendation panel above. Try also using the big input on the page to get a ranked top 3.",
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
        className="chat-fab"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open guided discovery chat"
      >
        <span className="chat-fab-icon">💬</span>
        <span className="chat-fab-label">Chat Hub</span>
      </button>

      <div className={`chat-panel${open ? ' chat-panel-open' : ''}`} id="chat-hub">
        <div className="chat-panel-header">
          <div>
            <div className="chat-panel-title">Guided Discovery Chat</div>
            <div className="chat-panel-sub">
              Tell us what you&apos;re trying to do — we&apos;ll help you find the right models.
            </div>
          </div>
          <button
            className="chat-panel-close"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
          >
            ×
          </button>
        </div>

        <div className="chat-panel-body">
          <div className="chat-messages">
            {messages.map((m) => (
              <div
                key={`${m.from}-${m.text}-${Math.random().toString(36).slice(2, 6)}`}
                className={`chat-message chat-message-${m.from}`}
              >
                {m.text}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="chat-suggestions">
            {SUGGESTIONS.map((s) => (
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
              placeholder="Describe your use case in plain language…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              className="chat-send-btn"
              onClick={handleSend}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

