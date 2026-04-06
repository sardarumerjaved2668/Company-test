'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useLocale } from '../../context/LocaleContext';
import api from '../../services/api';
import { getDiscoverFallback, getFallbackPapersThisWeek } from '../../data/discoverFallback';

const FILTER_IDS = ['all', 'reasoning', 'multimodal', 'alignment', 'efficiency', 'open_weights'];

const FILTER_ICONS = {
  all: '◎',
  reasoning: '🧠',
  multimodal: '🌐',
  alignment: '🛡️',
  efficiency: '⚡',
  open_weights: '📂',
};

const MODEL_ICON = {
  robot: '🤖',
};

function formatShortDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { month: '—', day: '—' };
  return {
    month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
    day: String(d.getDate()).padStart(2, '0'),
  };
}

function formatLongDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function normalizeFromApi(raw) {
  if (!raw) return null;
  const authors = Array.isArray(raw.authors) ? raw.authors : [];
  const authorLine = authors.join(', ');
  const models = Array.isArray(raw.modelsReferenced) ? raw.modelsReferenced : [];
  const keyFindings = Array.isArray(raw.keyFindings) && raw.keyFindings.length
    ? raw.keyFindings
    : [raw.snippet || '—'];

  return {
    id: raw.id || raw._id,
    source: raw.source || raw.lab || '',
    publishDate: raw.publishDate,
    category: raw.category || 'reasoning',
    title: raw.title,
    snippet: raw.snippet || raw.summary || '',
    arxivId: raw.arxivId || '',
    arxivUrl: raw.arxivUrl || '',
    authors: authorLine,
    authorList: authors,
    keyFindings,
    modelsReferenced: models.map((m) =>
      typeof m === 'string'
        ? { name: m, icon: 'robot' }
        : { name: m.name || '', icon: m.icon || 'robot' }
    ),
    impactLevel: raw.impactLevel || 'Medium',
    impactDescription: raw.impactDescription || '',
    citation: raw.citation || '',
  };
}

export default function DiscoverNewPage() {
  const { t } = useLocale();
  const [items, setItems] = useState([]);
  const [papersThisWeek, setPapersThisWeek] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [savedIds, setSavedIds] = useState(() => new Set());
  const [copyFlash, setCopyFlash] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = filter === 'all' ? {} : { category: filter };
    api
      .get('/discover', { params })
      .then(({ data }) => {
        if (cancelled) return;
        let list = data.success ? (data.items || []) : [];
        let week =
          typeof data.papersThisWeek === 'number' ? data.papersThisWeek : list.length;

        if (!list.length) {
          const fb = getDiscoverFallback();
          list =
            filter === 'all' ? fb : fb.filter((i) => i.category === filter);
          week = getFallbackPapersThisWeek();
        }

        setItems(list);
        setPapersThisWeek(week);
        setSelectedId((prev) => {
          if (!list.length) return null;
          const ids = list.map((i) => i.id || i._id);
          if (prev && ids.includes(prev)) return prev;
          return list[0].id || list[0]._id;
        });
      })
      .catch(() => {
        if (cancelled) return;
        const fb = getDiscoverFallback();
        const list =
          filter === 'all' ? fb : fb.filter((i) => i.category === filter);
        setItems(list);
        setPapersThisWeek(getFallbackPapersThisWeek());
        setSelectedId((prev) => {
          if (!list.length) return null;
          const ids = list.map((i) => i.id || i._id);
          if (prev && ids.includes(prev)) return prev;
          return list[0].id || list[0]._id;
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filter]);

  const selectedRaw = useMemo(() => {
    if (!items.length) return null;
    return (
      items.find((i) => (i.id || i._id) === selectedId) || items[0]
    );
  }, [items, selectedId]);

  const selected = useMemo(() => normalizeFromApi(selectedRaw), [selectedRaw]);

  const papersLabel = useMemo(() => {
    const n = papersThisWeek;
    const raw = t('discover.papersThisWeek');
    if (raw.includes('{count}')) return raw.replace('{count}', String(n));
    return `${n} ${raw}`;
  }, [papersThisWeek, t]);

  const categoryUpper = useCallback(
    (cat) => (cat ? String(t(`discover.filters.${cat}`) || cat).toUpperCase() : ''),
    [t]
  );

  const copyCitation = useCallback(() => {
    if (!selected?.citation) return;
    navigator.clipboard.writeText(selected.citation).then(() => {
      setCopyFlash('citation');
      setTimeout(() => setCopyFlash(null), 2000);
    });
  }, [selected]);

  const sharePage = useCallback(() => {
    const url = typeof globalThis !== 'undefined' && globalThis.location ? globalThis.location.href : '';
    globalThis.navigator?.clipboard?.writeText(url).then(() => {
      setCopyFlash('link');
      setTimeout(() => setCopyFlash(null), 2000);
    });
  }, []);

  const toggleSave = useCallback(() => {
    if (!selected?.id) return;
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(selected.id)) next.delete(selected.id);
      else next.add(selected.id);
      return next;
    });
  }, [selected]);

  const discussHref = selected
    ? `/chat-hub?from=discover&title=${encodeURIComponent(selected.title)}`
    : '/chat-hub';

  const arxivAbsUrl = selected?.arxivUrl || (selected?.arxivId ? `https://arxiv.org/abs/${selected.arxivId}` : '');

  return (
    <main className="dn-main">
      <div className="app-wrapper mk-app-full dn-page">
        <header className="dn-header">
          <div className="dn-header-row">
            <div>
              <h1 className="dn-title">{t('discover.title')}</h1>
              <p className="dn-subtitle">{t('discover.subtitle')}</p>
            </div>
            <div className="dn-header-meta">
              <span className="dn-meta-pill dn-meta-pill--week">{papersLabel}</span>
              <button type="button" className="dn-subscribe-btn" aria-label={t('discover.subscribe')}>
                <span className="dn-bell" aria-hidden>
                  🔔
                </span>
                {t('discover.subscribe')}
              </button>
            </div>
          </div>

          <div className="dn-filter-row" role="tablist" aria-label={t('discover.title')}>
            {FILTER_IDS.map((id) => {
              const active = filter === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`dn-pill${active ? ' dn-pill--active' : ''} dn-pill--${id}`}
                  onClick={() => setFilter(id)}
                >
                  <span className="dn-pill-icon" aria-hidden>
                    {FILTER_ICONS[id] || '◇'}
                  </span>
                  {t(`discover.filters.${id}`)}
                </button>
              );
            })}
          </div>
        </header>

        {loading && <p className="dn-status">{t('discover.loading')}</p>}

        {!loading && items.length === 0 && (
          <p className="dn-status">{t('discover.empty')}</p>
        )}

        {!loading && items.length > 0 && selected && (
          <div className="dn-layout">
            <aside className="dn-list" aria-label="Articles">
              {items.map((item) => {
                const row = normalizeFromApi(item);
                const { month, day } = formatShortDate(item.publishDate);
                const isSel = (item.id || item._id) === selected.id;
                const cat = item.category || 'reasoning';
                return (
                  <button
                    key={row.id}
                    type="button"
                    className={`dn-list-item${isSel ? ' dn-list-item--active' : ''}`}
                    onClick={() => setSelectedId(row.id)}
                  >
                    <div className="dn-list-date">
                      <span className="dn-list-month">{month}</span>
                      <span className="dn-list-day">{day}</span>
                    </div>
                    <div className="dn-list-body">
                      <div className="dn-list-meta">
                        {row.source}{' '}
                        <span className={`dn-list-cat dn-list-cat--${cat}`}>{categoryUpper(cat)}</span>
                      </div>
                      <div className="dn-list-title">{row.title}</div>
                      <p className="dn-list-snippet">{row.snippet}</p>
                    </div>
                  </button>
                );
              })}
            </aside>

            <article className="dn-detail">
              <div className="dn-detail-kicker">
                <span className="dn-detail-source">{selected.source}</span>
                <span className="dn-detail-dot" aria-hidden>
                  {' '}
                  •{' '}
                </span>
                <time dateTime={selected.publishDate}>{formatLongDate(selected.publishDate)}</time>
                <span className={`dn-detail-badge dn-detail-badge--${selected.category}`}>
                  {categoryUpper(selected.category)}
                </span>
              </div>

              <h2 className="dn-detail-title">{selected.title}</h2>

              <div className="dn-detail-meta">
                {arxivAbsUrl ? (
                  <a
                    href={arxivAbsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dn-detail-arxiv-link"
                  >
                    <span className="dn-detail-link-ico" aria-hidden>
                      🔗
                    </span>
                    {t('discover.arxivPrefix')}
                    {selected.arxivId}
                  </a>
                ) : (
                  <span className="dn-detail-muted">{t('discover.arxivPrefix')}{selected.arxivId || '—'}</span>
                )}
                <span className="dn-detail-dot" aria-hidden>
                  {' '}
                  •{' '}
                </span>
                <span className="dn-detail-authors">{selected.authors}</span>
              </div>

              <section className="dn-block">
                <h3 className="dn-block-heading">{t('discover.sections.keyFindings')}</h3>
                <ol className="dn-findings">
                  {selected.keyFindings.map((line, idx) => (
                    <li key={`${selected.id}-f-${idx}`} className="dn-finding-item">
                      <span className="dn-finding-num">{idx + 1}</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="dn-block">
                <h3 className="dn-block-heading">{t('discover.sections.modelsReferenced')}</h3>
                <div className="dn-model-tags">
                  {selected.modelsReferenced.map((m, mi) => (
                    <span key={`${m.name}-${mi}`} className="dn-model-pill">
                      <span className="dn-model-icon" aria-hidden>
                        {MODEL_ICON[m.icon] || MODEL_ICON.robot}
                      </span>
                      {m.name}
                    </span>
                  ))}
                </div>
              </section>

              <section className="dn-block dn-impact-wrap">
                <h3 className="dn-block-heading">{t('discover.sections.impact')}</h3>
                <div className="dn-impact">
                  <p className="dn-impact-body">
                    <span className="dn-impact-bolt" aria-hidden>
                      ⚡
                    </span>
                    <strong className="dn-impact-level">{selected.impactLevel}</strong>
                    {' — '}
                    {selected.impactDescription}
                  </p>
                </div>
              </section>

              <section className="dn-block">
                <h3 className="dn-block-heading">{t('discover.sections.citation')}</h3>
                <div className="dn-citation-box">
                  <div className="dn-citation-row">
                    <pre className="dn-citation-text">{selected.citation}</pre>
                    <button type="button" className="dn-copy-btn" onClick={copyCitation}>
                      {copyFlash === 'citation' ? t('discover.copied') : t('discover.copy')}
                    </button>
                  </div>
                  {selected.arxivId ? (
                    <div className="dn-citation-footer">
                      <a
                        href={arxivAbsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dn-citation-arxiv"
                      >
                        arxiv:{selected.arxivId} /
                      </a>
                    </div>
                  ) : null}
                </div>
              </section>

              <footer className="dn-actions">
                <Link href={discussHref} className="dn-cta">
                  <span className="dn-cta-ico" aria-hidden>
                    💬
                  </span>
                  {t('discover.discussChatHub')}
                </Link>
                <div className="dn-actions-side">
                  <button
                    type="button"
                    className={`dn-outline-btn${savedIds.has(selected.id) ? ' dn-outline-btn--on' : ''}`}
                    onClick={toggleSave}
                    aria-pressed={savedIds.has(selected.id)}
                  >
                    <span className="dn-outline-btn-ico" aria-hidden>
                      {savedIds.has(selected.id) ? '♥' : '♡'}
                    </span>
                    {t('discover.save')}
                  </button>
                  <button type="button" className="dn-outline-btn" onClick={sharePage}>
                    <span className="dn-outline-btn-ico" aria-hidden>
                      🔗
                    </span>
                    {t('discover.share')}
                  </button>
                </div>
              </footer>
              {copyFlash === 'link' && (
                <p className="dn-toast" role="status">
                  {t('discover.linkCopied')}
                </p>
              )}
            </article>
          </div>
        )}
      </div>
    </main>
  );
}
