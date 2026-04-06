'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale } from '../context/LocaleContext';
import { useWorkbenchSearch } from '../hooks/useWorkbenchSearch';
import { fetchWorkbenchToolbar } from '../services/agentService';
import { WORKBENCH_TOOLBAR_FALLBACK } from '../data/workbenchToolbarFallback';

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

  const [toolbarActions, setToolbarActions] = useState(WORKBENCH_TOOLBAR_FALLBACK);
  const [activeToolId, setActiveToolId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const actions = await fetchWorkbenchToolbar();
        if (!cancelled && Array.isArray(actions) && actions.length > 0) {
          setToolbarActions(actions);
        }
      } catch {
        if (!cancelled) setToolbarActions(WORKBENCH_TOOLBAR_FALLBACK);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const send = useCallback(() => {
    const text = query.trim();
    if (text.length < 1) return;
    onSubmit?.(text);
  }, [query, onSubmit]);

  const handleToolbarClick = useCallback(
    (action) => {
      if (!action?.category) return;
      setActiveToolId(action.id);
      setCategory(action.category);
      if (action.queryHint) setQuery(action.queryHint);
      setPage(1);
      window.setTimeout(() => setActiveToolId(null), 450);
    },
    [setCategory, setQuery, setPage]
  );

  const onKeyDownArea = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    },
    [send]
  );

  const showHero = showHeadline !== undefined ? showHeadline : variant === 'agents';

  const labels = {
    prev: t('workbench.pagination.prev'),
    next: t('workbench.pagination.next'),
    pageOf: t('workbench.pagination.pageOf'),
    matches: t('workbench.pagination.matches'),
  };

  const catLabel = t(`workbench.categories.${category}`);

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
            <textarea
              className="wb-textarea"
              rows={2}
              placeholder={t('workbench.placeholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDownArea}
              maxLength={2000}
              aria-label={t('workbench.placeholder')}
            />
            <div className="wb-input-toolbar">
              <div className="wb-toolbar-icons" role="toolbar" aria-label={t('workbench.toolbarAria')}>
                {toolbarActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    className={`wb-icon-btn${activeToolId === action.id ? ' wb-icon-btn--active' : ''}`}
                    onClick={() => handleToolbarClick(action)}
                    disabled={loading}
                    aria-label={action.queryHint || action.id}
                    title={action.queryHint || action.id}
                  >
                    {action.icon}
                  </button>
                ))}
              </div>
              <span className="wb-agent-pill">{t('workbench.agentLabel')}</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          className={`wb-send${loading ? ' wb-send--loading' : ''}`}
          onClick={send}
          disabled={loading}
          aria-label={t('workbench.send')}
        >
          {loading ? <span className="wb-spinner" /> : <span className="wb-send-icon">➤</span>}
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
            onClick={() => setCategory(id)}
          >
            <span className="wb-chip-ico">{CAT_ICONS[id]}</span>
            <span>{t(`workbench.categories.${id}`)}</span>
          </button>
        ))}
      </div>

      <div className="wb-suggestions wb-suggestions--panel">
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
              <button type="button" className="wb-shuffle" onClick={shuffle} disabled={loading}>
                🔀 {t('workbench.shuffle')}
              </button>
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
              <span className="wb-meta">
                {totalMatches > 0 ? `${totalMatches} match${totalMatches === 1 ? '' : 'es'}` : null}
              </span>
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
