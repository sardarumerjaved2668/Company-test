'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import RecommendPanel from '../components/RecommendPanel';
import WorkbenchSearch from '../components/WorkbenchSearch';
import { useLocale } from '../context/LocaleContext';
import homeContent from '../data/homeContent.json';
import { overlayHomeItem } from '../i18n/mergeHomeContent';

export default function HomePage() {
  const { t, messages } = useLocale();
  const router = useRouter();
  const {
    stats,
    featuredModels,
    labs,
    builderFeatures,
    budgets,
    useCases,
    flagshipModels,
    trending,
  } = homeContent;

  const bf = useMemo(
    () => builderFeatures.map((item) => overlayHomeItem(item, 'builderFeatures', item.id, messages)),
    [builderFeatures, messages]
  );
  const bud = useMemo(
    () => budgets.map((item) => overlayHomeItem(item, 'budgets', item.id, messages)),
    [budgets, messages]
  );
  const uc = useMemo(
    () => useCases.map((item) => overlayHomeItem(item, 'useCases', item.id, messages)),
    [useCases, messages]
  );
  const feat = useMemo(
    () => featuredModels.map((item) => overlayHomeItem(item, 'featured', item.id, messages)),
    [featuredModels, messages]
  );
  const trend = useMemo(
    () => trending.map((item) => overlayHomeItem(item, 'trending', item.id, messages)),
    [trending, messages]
  );
  const flag = useMemo(
    () => flagshipModels.map((item) => overlayHomeItem(item, 'flagship', item.id, messages)),
    [flagshipModels, messages]
  );
  const labsL = useMemo(
    () => labs.map((item) => overlayHomeItem(item, 'labs', item.id, messages)),
    [labs, messages]
  );

  const newsletterLines = t('home.newsletterTitle').split('\n');

  return (
    <main>
      <div className="app-wrapper">

        <section className="hero">
          <div className="hero-badge">
            <span>✦</span>
            <span>{t('home.badge')}</span>
          </div>
          <h1 className="hero-title">
            {t('home.heroLine1')}
            <br />
            <span className="hero-title-highlight">{t('home.heroHighlight')}</span>
            <br />
            {t('home.heroLine2')}
          </h1>
          <p className="hero-sub">
            {t('home.heroSub')}
          </p>

          <div className="hero-cta-row">
            <button
              type="button"
              className="hero-primary-btn"
              onClick={() => document.getElementById('rec-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              {t('home.ctaPrimary')}
            </button>
            <button
              type="button"
              className="hero-secondary-btn"
              onClick={() => document.getElementById('rec-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              {t('home.ctaSecondary')}
            </button>
          </div>

          <div className="hero-meta-row">
            <span>{t('home.stats.models', { count: stats.modelsCount })}</span>
            <span>{t('home.stats.builders', { count: stats.buildersCount })}</span>
            <span>{t('home.stats.labs', { count: stats.labsCount })}</span>
            <span>{t('home.stats.rating', { rating: stats.avgRating })}</span>
          </div>
        </section>

        <section className="home-workbench-section" aria-labelledby="home-workbench-title">
          <div className="home-workbench-head">
            <h2 id="home-workbench-title" className="home-workbench-title">
              {t('workbench.homeSectionTitle')}
            </h2>
            <p className="home-workbench-sub">{t('workbench.homeSectionSub')}</p>
          </div>
          <WorkbenchSearch
            variant="home"
            showHeadline={false}
            tableLayout={false}
            onSubmit={(text) => router.push(`/agents?q=${encodeURIComponent(text)}`)}
          />
        </section>

        <section id="rec-panel">
          <RecommendPanel onResults={() => {}} />
        </section>

        <section className="builder-section">
          <div className="section-header">
            <h2 className="section-title">{t('home.builderSection')}</h2>
          </div>
          <div className="builder-grid">
            {bf.map((item) => (
              <article key={item.id} className="builder-card">
                <div className="builder-icon">{item.icon}</div>
                <h3 className="builder-title">{item.title}</h3>
                <p className="builder-text">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="flagship-section">
          <div className="section-header">
            <h2 className="section-title">{t('home.flagshipTitle')}</h2>
            <span className="section-count">{t('home.flagshipCompare')}</span>
          </div>
          <div className="flagship-table-wrapper">
            <table className="flagship-table">
              <thead>
                <tr>
                  <th>{t('home.table.model')}</th>
                  <th>{t('home.table.lab')}</th>
                  <th>{t('home.table.context')}</th>
                  <th>{t('home.table.input')}</th>
                  <th>{t('home.table.output')}</th>
                  <th>{t('home.table.multimodal')}</th>
                  <th>{t('home.table.speed')}</th>
                  <th>{t('home.table.bestFor')}</th>
                </tr>
              </thead>
              <tbody>
                {flag.map((row) => (
                  <tr key={row.id}>
                    <td>{row.model}</td>
                    <td>{row.lab}</td>
                    <td>{row.context}</td>
                    <td>{row.input}</td>
                    <td>{row.output}</td>
                    <td>{row.multimodal}</td>
                    <td>{row.speed}</td>
                    <td>{row.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="flagship-note">
              {t('home.flagshipNote')}
            </p>
          </div>
        </section>

        <section className="trending-section">
          <div className="section-header">
            <h2 className="section-title">{t('home.trendingTitle')}</h2>
            <span className="section-count">{t('home.trendingLink')}</span>
          </div>
          <div className="trending-grid">
            {trend.map((item) => (
              <article key={item.id} className="trending-card">
                <div className="trending-badge">{item.badge}</div>
                <div className="trending-lab">{item.lab}</div>
                <h3 className="trending-title">{item.title}</h3>
                <p className="trending-text">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="labs-section">
          <div className="section-header">
            <h2 className="section-title">{t('home.labsTitle')}</h2>
            <span className="section-count">{t('home.labsLink')}</span>
          </div>
          <div className="labs-row">
            {labsL.map((lab) => (
              <div key={lab.id} className="lab-pill">
                <span className="lab-icon">{lab.icon}</span>
                <div className="lab-meta">
                  <div className="lab-name">{lab.name}</div>
                  <div className="lab-summary">{lab.summary}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="budget-section">
          <div className="section-header">
            <h2 className="section-title">{t('home.budgetTitle')}</h2>
          </div>
          <div className="budget-grid">
            {bud.map((tier) => (
              <article key={tier.id} className="budget-card">
                <div className="budget-emoji">{tier.emoji}</div>
                <h3 className="budget-title">{tier.label}</h3>
                <p className="budget-text">{tier.summary}</p>
                <button type="button" className="budget-cta">
                  {tier.countLabel}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="usecase-section">
          <div className="section-header">
            <h2 className="section-title">{t('home.useCaseTitle')}</h2>
          </div>
          <div className="usecase-grid">
            {uc.map((use) => (
              <article key={use.id} className="usecase-card">
                <div className="usecase-emoji">{use.emoji}</div>
                <h3 className="usecase-title">{use.title}</h3>
                <p className="usecase-models">{use.models}</p>
                <button type="button" className="usecase-cta">
                  {use.cta}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="featured-section">
          <div className="section-header">
            <h2 className="section-title">{t('home.featuredTitle')}</h2>
            <span className="section-count">{t('home.featuredBrowse', { count: stats.modelsCount })}</span>
          </div>
          <div className="featured-grid">
            {feat.map((fm) => (
              <article key={fm.id} className="featured-card">
                <div className="featured-badge">{fm.badge}</div>
                <div className="featured-lab">{fm.lab}</div>
                <h3 className="featured-title">{fm.label}</h3>
                <p className="featured-tag">{fm.tag}</p>
                <p className="featured-text">{fm.description}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="home-newsletter-footer">
        <section className="newsletter-section">
          <div className="newsletter-inner">
            <h2 className="newsletter-title">
              {newsletterLines.map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {line}
                </span>
              ))}
            </h2>
            <p className="newsletter-text">
              {t('home.newsletterText')}
            </p>
            <form
              className="newsletter-form"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <input
                type="email"
                className="newsletter-input"
                placeholder={t('home.newsletterPlaceholder')}
              />
              <button type="submit" className="newsletter-btn">
                {t('home.newsletterCta')}
              </button>
            </form>
            <p className="newsletter-meta">
              {t('home.newsletterMeta')}
            </p>
          </div>
        </section>

        <footer className="site-footer">
          <div className="site-footer-inner">
            <div className="footer-left">
              <div className="footer-brand">{t('home.footerBrand')}</div>
              <div className="footer-meta">{t('home.footerMeta')}</div>
            </div>
            <nav className="footer-right" aria-label="Footer navigation">
              <button type="button" className="footer-link">
                {t('home.footerModels')}
              </button>
              <button type="button" className="footer-link">
                {t('home.footerResearch')}
              </button>
              <button type="button" className="footer-link">
                {t('home.footerApi')}
              </button>
              <button type="button" className="footer-link">
                {t('home.footerPrivacy')}
              </button>
              <button type="button" className="footer-link">
                {t('home.footerTerms')}
              </button>
            </nav>
          </div>
        </footer>
      </div>
    </main>
  );
}
