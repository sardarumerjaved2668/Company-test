'use client';

import { useState, useEffect } from 'react';
import { useLocale } from '../../context/LocaleContext';
import api from '../../services/api';

export default function DiscoverNewPage() {
  const { t } = useLocale();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.get('/discover')
      .then(({ data }) => {
        if (!cancelled && data.success) setItems(data.items || []);
      })
      .catch(() => { /* non-critical */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d)) return { month: '—', day: '—' };
    return {
      month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
      day: String(d.getDate()).padStart(2, '0'),
    };
  }

  return (
    <main>
      <div className="app-wrapper mk-app-full">
        <header className="dn-header">
          <h1 className="dn-title">{t('discover.title')}</h1>
        </header>

        {loading && (
          <p style={{ color: '#9ca3af', fontSize: 14, padding: '24px' }}>
            {t('discover.loading') || 'Loading…'}
          </p>
        )}

        {!loading && items.length === 0 && (
          <p style={{ color: '#9ca3af', fontSize: 14, padding: '24px' }}>
            {t('discover.empty') || 'No items found.'}
          </p>
        )}

        <section className="dn-feed">
          {items.map((item) => {
            const { month, day } = formatDate(item.publishDate);
            return (
              <article key={item._id} className="dn-card">
                <div className="dn-card-date">
                  <span className="dn-card-month">{month}</span>
                  <span className="dn-card-day">{day}</span>
                </div>
                <div className="dn-card-main">
                  <div className="dn-card-lab">{item.lab}</div>
                  <h2 className="dn-card-title">{item.title}</h2>
                  <p className="dn-card-summary">{item.summary}</p>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
