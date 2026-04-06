'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '../context/LocaleContext';
import { useWorkbenchSearch } from '../hooks/useWorkbenchSearch';

export const WORKBENCH_CATEGORY_IDS = [
  'use_cases',
  'build_business',
  'help_learn',
  'monitor',
  'research',
  'create_content',
  'analyze_research',
];

const CAT_ICONS = {
  use_cases: '📋',
  build_business: '💼',
  help_learn: '📚',
  monitor: '👁️',
  research: '🔍',
  create_content: '✍️',
  analyze_research: '📊',
};

/** Netlify-style toolbar: fixed icons + category hints (interactive filters). */
const NETLIFY_TOOLBAR = [
  { id: 'mic', icon: '🎤', tone: 'purple', category: 'create_content', queryHint: 'Voice, audio, or podcast ideas' },
  { id: 'clip', icon: '📎', tone: 'orange', category: 'use_cases', queryHint: 'Documents, files, and attachments' },
  { id: 'img', icon: '🖼️', tone: 'blue', category: 'create_content', queryHint: 'Images, visuals, and design' },
  { id: 'dl', icon: '⬇️', tone: 'cyan', category: 'analyze_research', queryHint: 'Data, exports, and analysis' },
  { id: 'vid', icon: '🎬', tone: 'pink', category: 'create_content', queryHint: 'Video scripts and motion content' },
  { id: 'scr', icon: '🖥️', tone: 'green', category: 'monitor', queryHint: 'Dashboards, monitoring, and ops' },
  { id: 'more', icon: '➕', tone: 'neutral', category: 'use_cases', queryHint: 'Explore new use cases' },
];

function TablePagination({ page, totalPages, total, onPageChange, disabled, labels }) {
  return (
    <div className="tbl-pager" role="navigation" aria-label="Suggestion pages">
      <button
        type="button"
        className="tbl-pager-btn"
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        {labels.prev}
      </button>
      <span className="tbl-pager-meta">
        {labels.pageOf.replace('{{page}}', String(page)).replace('{{total}}', String(totalPages))} · {total}{' '}
        {labels.matches}
      </span>
      <button
        type="button"
        className="tbl-pager-btn"
        disabled={disabled || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        {labels.next}
      </button>
    </div>
  );
}

/**
 * @param {{ variant?: 'home' | 'agents', showHeadline?: boolean, initialQuery?: string, tableLayout?: boolean, onSubmit?: (text: string) => void }} props
 */
export default function WorkbenchSearch({
  variant = 'agents',
  showHeadline,
  initialQuery = '',
  tableLayout,
  onSubmit,
}) {
  const { t } = useLocale();
  const router = useRouter();
  const useTable = tableLayout !== undefined ? tableLayout : variant === 'agents';
  const {
    query,
    setQuery,
    category,
    setCategory,
    suggestions,
    totalMatches,
    totalPages,
    page,
    setPage,
    loading,
    error,
    shuffle,
  } = useWorkbenchSearch('use_cases', initialQuery);

  const [activeToolId, setActiveToolId] = useState(null);
  const [agentMode, setAgentMode] = useState(true);

  const handleToolbarClick = useCallback(
    (action) => {
      if (!action?.category) return;
      setActiveToolId(action.id);
      setCategory(action.category);
      if (action.queryHint) setQuery(action.queryHint);
      setPage(1);
      window.setTimeout(() => setActiveToolId(null), 500);
    },
    [setCategory, setQuery, setPage]
  );

  const send = useCallback(() => {
    const text = query.trim();
    if (text.length < 1) return;
    onSubmit?.(text);
  }, [query, onSubmit]);

  const onKeyDownArea = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    },
    [send]
  );

  const toggleStar = useCallback(() => {
    try {
      const raw = localStorage.getItem('nexusai:wb:favorites');
      const list = raw ? JSON.parse(raw) : [];
      const q = query.trim();
      if (!q) return;
      const next = list.includes(q) ? list.filter((x) => x !== q) : [...list, q].slice(-20);
      localStorage.setItem('nexusai:wb:favorites', JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, [query]);

  const insertDemo = useCallback(() => {
    setQuery('Help me choose an AI model for summarising long documents and drafting emails.');
    setCategory('research');
    setPage(1);
  }, [setQuery, setCategory, setPage]);

  const showHero = showHeadline !== undefined ? showHeadline : variant === 'agents';
  const placeholder =
    variant === 'home' ? t('workbench.placeholderHome') : t('workbench.placeholder');

  const labels = {
    prev: t('workbench.pagination.prev'),
    next: t('workbench.pagination.next'),
    pageOf: t('workbench.pagination.pageOf'),
    matches: t('workbench.pagination.matches'),
  };

  const catLabel = t(`workbench.categories.${category}`);
  const canSend = query.trim().length >= 1;
  const matchesLabel =
    totalMatches > 0 ? `${totalMatches} match${totalMatches === 1 ? '' : 'es'}` : null;

  return (
    <div className={`wb-root wb-root--${variant}${useTable ? ' wb-root--table' : ''}`}>
      {showHero && (
        <div className="wb-hero">
          <h2 className="wb-hero-title">
            {t('workbench.headline')}{' '}
            <span className="wb-hero-accent">{t('workbench.headlineAccent')}</span>
          </h2>
          <p className="wb-hero-sub">{t('workbench.sub')}</p>
        </div>
      )}

      <div className="wb-search-row">
        <div className="wb-input-wrap">
          <div className="wb-input-inner">
            <div className="wb-input-body">
              <textarea
                className="wb-textarea"
                rows={variant === 'home' ? 3 : 2}
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDownArea}
                maxLength={2000}
                aria-label={placeholder}
              />
              <div className="wb-input-top-tools">
                <button
                  type="button"
                  className="wb-mini-circle wb-mini-circle--lime"
                  onClick={toggleStar}
                  title={t('workbench.starPrompt')}
                  aria-label={t('workbench.starPrompt')}
                >
                  ✦
                </button>
                <button
                  type="button"
                  className="wb-mini-circle wb-mini-circle--sky"
                  onClick={insertDemo}
                  title={t('workbench.quickDemo')}
                  aria-label={t('workbench.quickDemo')}
                >
                  ▶
                </button>
              </div>
            </div>

            <div className="wb-input-toolbar">
              <div className="wb-toolbar-icons" role="toolbar" aria-label={t('workbench.toolbarAria')}>
                {NETLIFY_TOOLBAR.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    className={`wb-icon-btn wb-icon-btn--${action.tone}${activeToolId === action.id ? ' wb-icon-btn--active' : ''}`}
                    data-tone={action.tone}
                    onClick={() => handleToolbarClick(action)}
                    disabled={loading}
                    aria-label={action.queryHint || action.id}
                    title={action.queryHint || action.id}
                  >
                    {action.icon}
                  </button>
                ))}
              </div>
              <span className="wb-toolbar-divider" aria-hidden />
              <button
                type="button"
                className={`wb-agent-pill${agentMode ? ' wb-agent-pill--on' : ''}`}
                onClick={() => setAgentMode((v) => !v)}
                aria-pressed={agentMode}
                aria-label={agentMode ? t('workbench.agentModeOn') : t('workbench.agentModeOff')}
                title={agentMode ? t('workbench.agentModeOn') : t('workbench.agentModeOff')}
              >
                <span className="wb-agent-pill-ico" aria-hidden>
                  🖥
                </span>
                <span>{t('workbench.agentLabel')}</span>
                <span className="wb-agent-pill-plus">+</span>
              </button>
            </div>
          </div>
        </div>
        <button
          type="button"
          className={`wb-send${loading ? ' wb-send--loading' : ''}`}
          onClick={send}
          disabled={loading || !canSend}
          aria-label={`${t('workbench.letsGo')} — ${t('workbench.send')}`}
        >
          {loading ? (
            <span className="wb-spinner" />
          ) : (
            <span className="wb-send-icon" aria-hidden>
              ✈
            </span>
          )}
        </button>
      </div>

      <div className="wb-chips" role="tablist" aria-label="Use case categories">
        {WORKBENCH_CATEGORY_IDS.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={category === id}
            className={`wb-chip${category === id ? ' wb-chip--active' : ''}`}
            onClick={() => {
              setCategory(id);
              setPage(1);
            }}
          >
            <span className="wb-chip-ico">{CAT_ICONS[id]}</span>
            <span>{t(`workbench.categories.${id}`)}</span>
          </button>
        ))}
      </div>

      <div className={`wb-suggestions wb-suggestions--panel${agentMode ? ' wb-suggestions--agent' : ''}`}>
        {error && <p className="wb-error">{error}</p>}

        {useTable ? (
          <div className="tbl-wrap tbl-wrap--suggestions">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="col-icon">{t('workbench.table.icon')}</th>
                  <th>{t('workbench.table.suggestion')}</th>
                  <th className="col-cat">{t('workbench.table.category')}</th>
                  <th className="col-actions">{t('workbench.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {loading && suggestions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="tbl-loading">
                      …
                    </td>
                  </tr>
                )}
                {!loading &&
                  suggestions.map((s) => (
                    <tr key={s.id}>
                      <td className="td-icon">{s.icon}</td>
                      <td>
                        <button
                          type="button"
                          className="tbl-link"
                          onClick={() => {
                            setQuery(s.text);
                            onSubmit?.(s.text);
                          }}
                        >
                          {s.text}
                        </button>
                      </td>
                      <td className="td-muted">{catLabel}</td>
                      <td>
                        <button
                          type="button"
                          className="tbl-btn"
                          onClick={() => {
                            setQuery(s.text);
                            onSubmit?.(s.text);
                          }}
                        >
                          {t('workbench.table.use')}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <div className="tbl-toolbar">
              <div className="tbl-toolbar-left">
                <button type="button" className="wb-shuffle" onClick={shuffle} disabled={loading}>
                  🔀 {t('workbench.shuffle')}
                </button>
                {variant === 'home' ? (
                  <button type="button" className="wb-view-all" onClick={() => router.push('/agents')}>
                    {t('workbench.viewAll')} →
                  </button>
                ) : null}
              </div>
              <TablePagination
                page={page}
                totalPages={totalPages}
                total={totalMatches}
                onPageChange={setPage}
                disabled={loading}
                labels={labels}
              />
            </div>
          </div>
        ) : (
          <>
            <ul className="wb-suggest-list">
              {loading && suggestions.length === 0 && (
                <li className="wb-suggest-item wb-suggest-item--ghost">…</li>
              )}
              {!loading &&
                suggestions.map((s) => (
                  <li key={s.id} className="wb-suggest-item">
                    <span className="wb-suggest-ico">{s.icon}</span>
                    <button
                      type="button"
                      className="wb-suggest-text"
                      onClick={() => {
                        setQuery(s.text);
                        onSubmit?.(s.text);
                      }}
                    >
                      {s.text}
                    </button>
                  </li>
                ))}
            </ul>
            <div className="wb-suggest-footer">
              <span className="wb-meta">{matchesLabel}</span>
              <button type="button" className="wb-shuffle" onClick={shuffle}>
                🔀 {t('workbench.shuffle')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
