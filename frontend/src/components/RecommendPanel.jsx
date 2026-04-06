'use client';

import { useMemo, useState } from 'react';
import { useLocale } from '../context/LocaleContext';
import { RECOMMEND_PROMPTS } from '../i18n/recommendPrompts';
import { useRecommendation } from '../hooks/useRecommendation';

const QUICK_KEYS = [
  'createImage',
  'generateAudio',
  'createVideo',
  'createSlides',
  'createInfographs',
  'createQuiz',
  'flashcards',
  'mindMap',
  'analyseData',
  'writeContent',
  'codeGeneration',
  'documentAnalysis',
  'translate',
  'justExploring',
];

export default function RecommendPanel({ onResults, models }) {
  const { t } = useLocale();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { recommend } = useRecommendation();

  const quick = useMemo(
    () =>
      QUICK_KEYS.map((key) => ({
        label: t(`recommend.quick.${key}`),
        icon: {
          createImage: '🎨',
          generateAudio: '🎵',
          createVideo: '🎬',
          createSlides: '📊',
          createInfographs: '📈',
          createQuiz: '❓',
          flashcards: '🗂️',
          mindMap: '🧠',
          analyseData: '📉',
          writeContent: '✍️',
          codeGeneration: '💻',
          documentAnalysis: '📄',
          translate: '🌐',
          justExploring: '🔭',
        }[key],
        prompt: RECOMMEND_PROMPTS[key],
      })),
    [t]
  );

  const run = async (q) => {
    const text = (q ?? query).trim();
    if (text.length < 4) {
      setError(t('recommend.errorMin'));
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
      <div className="panel-label"><span>✦</span> {t('recommend.panelLabel')}</div>
      <h2>{t('recommend.title')}</h2>
      <p>{t('recommend.subtitle')}</p>

      <div className="input-wrapper">
        <div className="input-shell">
          <div className="input-shell-inner">
            <input
              type="text"
              className="recommend-input"
              placeholder={t('recommend.placeholder')}
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
              <span>{t('recommend.working')}</span>
            </>
          ) : (
            <>
              <span className="btn-recommend-icon">🔍</span>
              <span>{t('recommend.go')}</span>
            </>
          )}
        </button>
      </div>

      {error && <p className="input-error">{error}</p>}

      <div className="quick-prompts">
        {quick.map(({ label, icon, prompt }) => (
          <button
            key={prompt}
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
