'use client';

import { useLocale } from '../../context/LocaleContext';

const AGENT_TEMPLATES = [
  { id: 'research', model: 'GPT‑4.5' },
  { id: 'support', model: 'GPT‑4.5' },
  { id: 'review', model: 'Claude Opus 4.5' },
  { id: 'analysis', model: 'Gemini' },
  { id: 'content', model: 'GPT‑4.1' },
];

export default function AgentsPage() {
  const { t, messages } = useLocale();

  return (
    <main>
      <div className="app-wrapper mk-app-full">
        <section className="ag-header">
          <div>
            <h1 className="ag-title">{t('agents.title')}</h1>
            <p className="ag-sub">
              {t('agents.subtitle')}
            </p>
          </div>
        </section>

        <section className="ag-shell">
          <aside className="ag-left-rail">
            <button type="button" className="ag-new-btn">
              {t('agents.newAgent')}
            </button>
          </aside>

          <section className="ag-canvas">
            <div className="ag-canvas-inner">
              <div className="ag-canvas-hint">
                <h2>{t('agents.canvasTitle')}</h2>
                <p>
                  {t('agents.canvasText')}
                </p>
                <button type="button" className="ag-ask-btn">
                  {t('agents.askHub')}
                </button>
              </div>
            </div>
          </section>

          <aside className="ag-templates">
            <h2 className="ag-templates-title">{t('agents.templatesTitle')}</h2>
            <div className="ag-templates-grid">
              {AGENT_TEMPLATES.map((tpl) => {
                const block = messages.agents?.templates?.[tpl.id];
                const title = block?.title || tpl.id;
                const description = block?.description || '';
                const tags = block?.tags || [];
                return (
                  <article key={tpl.id} className="ag-template-card">
                    <div className="ag-template-icon">📄</div>
                    <h3 className="ag-template-title">{title}</h3>
                    <p className="ag-template-desc">{description}</p>
                    <div className="ag-template-meta">
                      <span className="ag-template-model">{tpl.model}</span>
                      <div className="ag-template-tags">
                        {tags.map((tag) => (
                          <span key={tag} className="ag-template-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button type="button" className="ag-template-link">
                      {t('agents.useTemplate')}
                    </button>
                  </article>
                );
              })}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
