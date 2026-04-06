'use client';

import { useLocale } from '../../context/LocaleContext';

const FEED_ITEMS = [
  { id: 1, month: 'MAR', day: '26', lab: 'Google DeepMind' },
  { id: 2, month: 'MAR', day: '22', lab: 'MIT CSAIL' },
  { id: 3, month: 'MAR', day: '18', lab: 'Anthropic' },
  { id: 4, month: 'MAR', day: '15', lab: 'Nexus AI' },
  { id: 5, month: 'MAR', day: '10', lab: 'Stanford NLP' },
  { id: 6, month: 'FEB', day: '5', lab: 'DeepSeek‑R1' },
];

export default function DiscoverNewPage() {
  const { t } = useLocale();

  return (
    <main>
      <div className="app-wrapper mk-app-full">
        <header className="dn-header">
          <h1 className="dn-title">{t('discover.title')}</h1>
        </header>

        <section className="dn-feed">
          {FEED_ITEMS.map((item) => (
            <article key={item.id} className="dn-card">
              <div className="dn-card-date">
                <span className="dn-card-month">{item.month}</span>
                <span className="dn-card-day">{item.day}</span>
              </div>
              <div className="dn-card-main">
                <div className="dn-card-lab">{item.lab}</div>
                <h2 className="dn-card-title">{t(`discover.items.${item.id}.title`)}</h2>
                <p className="dn-card-summary">{t(`discover.items.${item.id}.summary`)}</p>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
