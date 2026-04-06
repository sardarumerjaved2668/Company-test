'use client';

import { useLocale } from '../../context/LocaleContext';
import { useAgents } from '../../hooks/useAgents';

export default function AgentsPage() {
  const { t, messages } = useLocale();
  const { agents, loading, error } = useAgents();

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

            {loading && (
              <p style={{ color: '#9ca3af', fontSize: 14, padding: '12px 0' }}>
                {t('agents.loading') || 'Loading agents…'}
              </p>
            )}

            {error && (
              <p style={{ color: '#ef4444', fontSize: 14, padding: '12px 0' }}>
                {t('agents.error') || 'Failed to load agents.'}
              </p>
            )}

            {!loading && !error && (
              <div className="ag-templates-grid">
                {agents.map((agent) => {
                  const block = messages.agents?.templates?.[agent.templateId];
                  const title = block?.title || agent.title;
                  const description = block?.description || agent.description;
                  const tags = block?.tags || agent.tags || [];
                  return (
                    <article key={agent._id || agent.templateId} className="ag-template-card">
                      <div className="ag-template-icon">{agent.icon || '📄'}</div>
                      <h3 className="ag-template-title">{title}</h3>
                      <p className="ag-template-desc">{description}</p>
                      <div className="ag-template-meta">
                        <span className="ag-template-model">{agent.model}</span>
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
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}
