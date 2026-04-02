'use client';

import RecommendPanel from '../components/RecommendPanel';
import homeContent from '../data/homeContent.json';

export default function HomePage() {
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

  return (
    <main>
      <div className="app-wrapper">

        {/* Hero */}
        <section className="hero">
          <div className="hero-badge">
            <span>✦</span>
            <span>AI Model Marketplace</span>
          </div>
          <h1 className="hero-title">
            Find your perfect
            <br />
            <span className="hero-title-highlight">AI model</span>
            <br />
            with guided discovery
          </h1>
          <p className="hero-sub">
            You don&apos;t need to know anything about AI. Answer a few simple questions and we&apos;ll help you
            discover, compare, and deploy the right model for your use case.
          </p>

          <div className="hero-cta-row">
            <button
              type="button"
              className="hero-primary-btn"
              onClick={() => document.getElementById('rec-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              Let&apos;s go
            </button>
            <button
              type="button"
              className="hero-secondary-btn"
              onClick={() => document.getElementById('rec-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              Skip — search directly
            </button>
          </div>

          <div className="hero-meta-row">
            <span>{stats.modelsCount} AI Models</span>
            <span>{stats.buildersCount} Builders</span>
            <span>{stats.labsCount} AI Labs</span>
            <span>{stats.avgRating}⭐ Avg Rating</span>
          </div>
        </section>

        {/* Guided discovery box */}
        <section id="rec-panel">
          <RecommendPanel onResults={() => {}} />
        </section>

        {/* Builder-friendly features */}
        <section className="builder-section">
          <div className="section-header">
            <h2 className="section-title">Built for every builder</h2>
          </div>
          <div className="builder-grid">
            {builderFeatures.map((item) => (
              <article key={item.id} className="builder-card">
                <div className="builder-icon">{item.icon}</div>
                <h3 className="builder-title">{item.title}</h3>
                <p className="builder-text">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Flagship comparison */}
        <section className="flagship-section">
          <div className="section-header">
            <h2 className="section-title">Flagship Model Comparison</h2>
            <span className="section-count">Compare all →</span>
          </div>
          <div className="flagship-table-wrapper">
            <table className="flagship-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Lab</th>
                  <th>Context</th>
                  <th>Input $/1M</th>
                  <th>Output $/1M</th>
                  <th>Multimodal</th>
                  <th>Speed</th>
                  <th>Best For</th>
                </tr>
              </thead>
              <tbody>
                {flagshipModels.map((row) => (
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
              * Prices shown are approximate. Free self-hosted models exclude infrastructure costs. Beta pricing may change.
            </p>
          </div>
        </section>

        {/* Trending */}
        <section className="trending-section">
          <div className="section-header">
            <h2 className="section-title">🔥 Trending This Week</h2>
            <span className="section-count">View research feed →</span>
          </div>
          <div className="trending-grid">
            {trending.map((item) => (
              <article key={item.id} className="trending-card">
                <div className="trending-badge">{item.badge}</div>
                <div className="trending-lab">{item.lab}</div>
                <h3 className="trending-title">{item.title}</h3>
                <p className="trending-text">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Labs */}
        <section className="labs-section">
          <div className="section-header">
            <h2 className="section-title">Browse by AI Lab</h2>
            <span className="section-count">See all labs →</span>
          </div>
          <div className="labs-row">
            {labs.map((lab) => (
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

        {/* Budget tiers */}
        <section className="budget-section">
          <div className="section-header">
            <h2 className="section-title">Find models by budget</h2>
          </div>
          <div className="budget-grid">
            {budgets.map((tier) => (
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

        {/* Quick-start use cases */}
        <section className="usecase-section">
          <div className="section-header">
            <h2 className="section-title">Quick-start by use case</h2>
          </div>
          <div className="usecase-grid">
            {useCases.map((use) => (
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

        {/* Featured models */}
        <section className="featured-section">
          <div className="section-header">
            <h2 className="section-title">Featured models</h2>
            <span className="section-count">Browse all {stats.modelsCount}</span>
          </div>
          <div className="featured-grid">
            {featuredModels.map((fm) => (
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

        {/* Newsletter + footer band */}
        <section className="newsletter-section">
          <div className="newsletter-inner">
            <h2 className="newsletter-title">
              New models drop every week.
              <br />
              Don&apos;t miss a release.
            </h2>
            <p className="newsletter-text">
              Get a curated weekly digest: new model releases, benchmark comparisons, pricing changes, and prompt tips —
              straight to your inbox.
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
                placeholder="you@example.com"
              />
              <button type="submit" className="newsletter-btn">
                Subscribe free →
              </button>
            </form>
            <p className="newsletter-meta">
              No spam. Unsubscribe any time.
            </p>
          </div>
        </section>

        <footer className="site-footer">
          <div className="site-footer-inner">
            <div className="footer-left">
              <div className="footer-brand">NexusAI Model Marketplace</div>
              <div className="footer-meta">New models, benchmark comparisons, pricing changes, and prompt tips.</div>
            </div>
            <nav className="footer-right" aria-label="Footer navigation">
              <button type="button" className="footer-link">
                Models
              </button>
              <button type="button" className="footer-link">
                Research
              </button>
              <button type="button" className="footer-link">
                API
              </button>
              <button type="button" className="footer-link">
                Privacy
              </button>
              <button type="button" className="footer-link">
                Terms
              </button>
            </nav>
          </div>
        </footer>
      </div>
    </main>
  );
}
