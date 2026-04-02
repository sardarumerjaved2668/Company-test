'use client';

import { useState } from 'react';
import { useRecommendation } from '../hooks/useRecommendation';

const QUICK = [
  { label:'Create image',      icon:'🎨', prompt:'Create high quality images and artwork for my brand and product visuals.' },
  { label:'Generate audio',    icon:'🎵', prompt:'Generate realistic voiceovers and audio content from text.' },
  { label:'Create video',      icon:'🎬', prompt:'Create short marketing and explainer videos from scripts or ideas.' },
  { label:'Create slides',     icon:'📊', prompt:'Turn a rough outline into a polished slide deck.' },
  { label:'Create infographs', icon:'📈', prompt:'Generate infographic-style visuals from data and bullet points.' },
  { label:'Create quiz',       icon:'❓', prompt:'Generate quizzes and questions from educational content.' },
  { label:'Flashcards',        icon:'🗂️', prompt:'Create flashcards to help me study key concepts.' },
  { label:'Mind map',          icon:'🧠', prompt:'Create a mind map for brainstorming and structuring ideas.' },
  { label:'Analyse data',      icon:'📉', prompt:'Analyse a dataset and surface insights, trends, and anomalies.' },
  { label:'Write content',     icon:'✍️', prompt:'Write long-form content, emails, and social posts in my tone.' },
  { label:'Code generation',   icon:'💻', prompt:'Generate, refactor, and explain code for my project.' },
  { label:'Document analysis', icon:'📄', prompt:'Summarise and analyse long documents and PDFs.' },
  { label:'Translate',         icon:'🌐', prompt:'Translate content between multiple languages while preserving tone.' },
  { label:'Just exploring',    icon:'🔭', prompt:'I am just exploring what AI models can do for me.' },
];

export default function RecommendPanel({ onResults, models }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { recommend } = useRecommendation();

  const run = async (q) => {
    const text = (q ?? query).trim();
    if (text.length < 4) {
      setError('Describe your use case (at least 4 characters).');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (models && models.length > 0) {
        const results = recommend(text, models);
        onResults?.(results, text);
      } else {
        onResults?.([], text);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="recommend-panel">
      <div className="panel-label"><span>✦</span> Guided discovery</div>
      <h2>Click the box and type anything</h2>
      <p>You don&apos;t need the right keywords. Just describe what you&apos;d like to do — we&apos;ll take it from there.</p>

      <div className="input-wrapper">
        <div className="input-shell">
          <div className="input-shell-inner">
            <input
              type="text"
              className="recommend-input"
              placeholder='Click here and type anything — or just say "help me choose an AI model for…"'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && run()}
              maxLength={400}
            />
            <div className="input-helpers">
              {['🖼️','🎵','🎬','📊','📈','❓','🗂️','🧠','📉','✍️','💻','📄','🌐','🔭'].map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className="input-helper-btn"
                  aria-label="helper icon"
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button
          type="button"
          className={`btn-recommend${loading ? ' loading' : ''}`}
          onClick={() => run()}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="spinner" />
              <span>Working…</span>
            </>
          ) : (
            <>
              <span className="btn-recommend-icon">🔍</span>
              <span>Let&apos;s go</span>
            </>
          )}
        </button>
      </div>

      {error && <p className="input-error">{error}</p>}

      <div className="quick-prompts">
        {QUICK.map(({ label, icon, prompt }) => (
          <button
            key={label}
            type="button"
            className="quick-prompt-btn"
            onClick={() => { setQuery(prompt); run(prompt); }}
          >
            <span className="quick-prompt-icon">{icon}</span>
            <span className="quick-prompt-label">{label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
