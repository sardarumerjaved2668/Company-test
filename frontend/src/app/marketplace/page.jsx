'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from '../../context/LocaleContext';

/* ── Static data ─────────────────────────────────────────────── */
const LAB_FILTER_IDS = [
  'allLabs', 'openai', 'anthropic', 'googleDeepMind',
  'meta', 'mistral', 'cohere', 'microsoft', 'amazon',
];

const LAB_FILTER_NEEDLE = {
  allLabs: null,
  openai: 'openai',
  anthropic: 'anthropic',
  googleDeepMind: 'google deepmind',
  meta: 'meta',
  mistral: 'mistral',
  cohere: 'cohere',
  microsoft: 'microsoft',
  amazon: 'amazon',
};

function labFilterMatches(model, filterId) {
  const needle = LAB_FILTER_NEEDLE[filterId];
  if (!needle) return true;
  return model.provider.toLowerCase().includes(needle);
}

const PROVIDERS     = ['OpenAI', 'Anthropic', 'Google DeepMind', 'Meta'];
const PRICING_TYPES = ['Pay-per-use', 'Subscription', 'Free tier'];
const PRICING_MSG_KEYS = ['payPerUse', 'subscription', 'freeTier'];

const TAG_CLASSES = {
  'Premium':        'mkc-tag-premium',
  'Cost-effective': 'mkc-tag-cost',
  'Turbo':          'mkc-tag-turbo',
  'Popular':        'mkc-tag-popular',
  'Everyday':       'mkc-tag-everyday',
  'Reasoning':      'mkc-tag-reasoning',
  'Open Source':    'mkc-tag-open',
  'New':            'mkc-tag-new',
};

const PROVIDER_COLORS = {
  OpenAI:           '#f97316',
  Anthropic:        '#d97706',
  'Google DeepMind':'#3b82f6',
  Google:           '#3b82f6',
  Meta:             '#8b5cf6',
  Mistral:          '#ec4899',
  Cohere:           '#10b981',
  Microsoft:        '#2563eb',
  Amazon:           '#f59e0b',
};

const MOCK_MODELS = [
  {
    id: 'gpt5',
    name: 'GPT-5',
    provider: 'OpenAI',
    badges: ['Flagship', 'Agents', 'Multimodal'],
    description: 'OpenAI flagship: native compute-aware agents, advanced reasoning, 2M context.',
    rating: '4.9', reviews: '2,120',
    inputPrice: '$2.50 / 1M', outputPrice: '$5.00 / 1M',
    tag: 'Premium',
  },
  {
    id: 'gpt52',
    name: 'GPT-5.2',
    provider: 'OpenAI',
    badges: ['Balanced', 'Multimodal', 'Streaming'],
    description: 'Mid-tier GPT-5 variant with improved instruction-following and multimodal support.',
    rating: '4.8', reviews: '1,630',
    inputPrice: '$1.40 / 1M', outputPrice: '$2.80 / 1M',
    tag: 'Cost-effective',
  },
  {
    id: 'gpt5turbo',
    name: 'GPT-5 Turbo',
    provider: 'OpenAI',
    badges: ['Cost-effective', 'High-volume'],
    description: 'Most cost-effective GPT-5 for high-volume workloads and background automation.',
    rating: '4.7', reviews: '980',
    inputPrice: '$0.80 / 1M', outputPrice: '$1.60 / 1M',
    tag: 'Turbo',
  },
  {
    id: 'gpt45',
    name: 'GPT-4.5',
    provider: 'OpenAI',
    badges: ['Creative', 'Long-form', 'Language'],
    description: 'Bridging model with improved creativity and long-form generation capabilities.',
    rating: '4.7', reviews: '3,470',
    inputPrice: '$0.60 / 1M', outputPrice: '$1.20 / 1M',
    tag: 'Popular',
  },
  {
    id: 'gpt41mini',
    name: 'GPT-4.1 mini',
    provider: 'OpenAI',
    badges: ['Everyday', 'Fast', 'Affordable'],
    description: 'Lightweight GPT-4.1 tier, ideal for everyday tasks and high-volume chat workloads.',
    rating: '4.6', reviews: '5,420',
    inputPrice: '$0.15 / 1M', outputPrice: '$0.60 / 1M',
    tag: 'Everyday',
  },
  {
    id: 'gpt4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    badges: ['Multimodal', 'Streaming'],
    description: "OpenAI's flagship GPT-4o for lightweight chat, realtime tools, and streaming responses.",
    rating: '4.8', reviews: '8,210',
    inputPrice: '$0.50 / 1M', outputPrice: '$1.50 / 1M',
    tag: 'Popular',
  },
  {
    id: 'o3',
    name: 'o3',
    provider: 'OpenAI',
    badges: ['Reasoning', 'Planning'],
    description: "OpenAI's advanced reasoning model with chain-of-thought for complex tasks and analysis.",
    rating: '4.9', reviews: '910',
    inputPrice: '$3.00 / 1M', outputPrice: '$6.00 / 1M',
    tag: 'Reasoning',
  },
  {
    id: 'claude-opus',
    name: 'Claude Opus 4.6',
    provider: 'Anthropic',
    badges: ['Reasoning', 'Long-context', 'Safety'],
    description: "Anthropic's most capable model for complex analysis, research, and nuanced writing tasks.",
    rating: '4.8', reviews: '4,120',
    inputPrice: '$15.00 / 1M', outputPrice: '$75.00 / 1M',
    tag: 'Premium',
  },
  {
    id: 'claude-sonnet',
    name: 'Claude Sonnet 4.6',
    provider: 'Anthropic',
    badges: ['Balanced', 'Coding', 'Analysis'],
    description: 'The ideal balance of speed and intelligence for high-throughput tasks and agentic workflows.',
    rating: '4.7', reviews: '6,830',
    inputPrice: '$3.00 / 1M', outputPrice: '$15.00 / 1M',
    tag: 'Popular',
  },
  {
    id: 'gemini-pro',
    name: 'Gemini 2.0 Pro',
    provider: 'Google DeepMind',
    badges: ['Multimodal', 'Search', 'Long-context'],
    description: "Google's flagship multimodal model with native video, image, and 2M context window.",
    rating: '4.7', reviews: '3,290',
    inputPrice: '$1.25 / 1M', outputPrice: '$5.00 / 1M',
    tag: 'Popular',
  },
  {
    id: 'gemini-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'Google DeepMind',
    badges: ['Fast', 'Cost-effective', 'Multimodal'],
    description: 'Ultra-fast Gemini model for real-time applications, agents, and high-frequency tasks.',
    rating: '4.6', reviews: '7,100',
    inputPrice: '$0.075 / 1M', outputPrice: '$0.30 / 1M',
    tag: 'Turbo',
  },
  {
    id: 'llama4',
    name: 'Llama 4 Scout',
    provider: 'Meta',
    badges: ['Open Source', 'Reasoning', 'Multimodal'],
    description: "Meta's open-source multimodal model with MoE architecture and 10M context window.",
    rating: '4.5', reviews: '2,880',
    inputPrice: 'Free', outputPrice: 'Self-hosted',
    tag: 'Open Source',
  },
];

/* ── ModelCard ───────────────────────────────────────────────── */
function MkCard({ model, onOpen }) {
  const { messages } = useLocale();
  const color  = PROVIDER_COLORS[model.provider] || '#C8622A';
  const tagCls = TAG_CLASSES[model.tag] || 'mkc-tag-popular';
  const loc = messages.marketplace?.models?.[model.id];
  const description = loc?.description || model.description;
  const badges = loc?.badges || model.badges;
  const tagLabel = messages.marketplace?.tags?.[model.tag] || model.tag;

  return (
    <article
      className="mkc-card"
      onClick={() => onOpen(model)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onOpen(model)}
    >
      <div className="mkc-head">
        <div className="mkc-icon" style={{ background: `${color}1a`, color }}>⚡</div>
        <div className="mkc-meta">
          <div className="mkc-name">{model.name}</div>
          <div className="mkc-prov">{model.provider}</div>
        </div>
        <span className={`mkc-tag ${tagCls}`}>{tagLabel}</span>
      </div>

      <p className="mkc-desc">{description}</p>

      <div className="mkc-chips">
        {badges.map((b) => (
          <span key={b} className="mkc-chip">{messages.marketplace?.tags?.[b] || b}</span>
        ))}
      </div>

      <div className="mkc-foot">
        <div className="mkc-rating">
          <span className="mkc-star">★</span>
          <span className="mkc-rval">{model.rating}</span>
          <span className="mkc-rcount">({model.reviews})</span>
        </div>
        <div className="mkc-price">{model.inputPrice} · {model.outputPrice}</div>
      </div>
    </article>
  );
}

/* ── Detail Modal ────────────────────────────────────────────── */
function MkModal({ model, onClose }) {
  const { t, messages } = useLocale();
  const color  = PROVIDER_COLORS[model.provider] || '#C8622A';
  const tagCls = TAG_CLASSES[model.tag] || 'mkc-tag-popular';
  const loc = messages.marketplace?.models?.[model.id];
  const description = loc?.description || model.description;
  const badges = loc?.badges || model.badges;
  const tagLabel = messages.marketplace?.tags?.[model.tag] || model.tag;

  return (
    <div
      className="modal-overlay open"
      role="dialog"
      aria-modal="true"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-panel">
        <button type="button" className="modal-close" onClick={onClose} aria-label={t('marketplace.modalClose')}>×</button>
        <div className="modal-body">
          <div className="modal-hero">
            <div className="modal-icon" style={{ background: `${color}1a`, color, fontSize: 28 }}>⚡</div>
            <div className="modal-title-group">
              <h2 className="modal-model-name">{model.name}</h2>
              <div className="modal-provider-row">
                <span className="modal-provider-name">{t('marketplace.modalBy')} {model.provider}</span>
                <span className={`mkc-tag ${tagCls}`}>{tagLabel}</span>
                <span className="modal-badge badge-api">{t('marketplace.apiAvailable')}</span>
              </div>
            </div>
          </div>

          <section className="modal-section">
            <h3 className="modal-section-title">{t('marketplace.aboutModel')}</h3>
            <p className="modal-description">{description}</p>
          </section>

          <section className="modal-section">
            <h3 className="modal-section-title">{t('marketplace.capabilities')}</h3>
            <div className="modal-categories">
              {badges.map((b) => (
                <span key={b} className="modal-cat-badge">{messages.marketplace?.tags?.[b] || b}</span>
              ))}
            </div>
          </section>

          <section className="modal-section">
            <h3 className="modal-section-title">{t('marketplace.pricing')}</h3>
            <div className="info-grid">
              <div className="info-item">
                <div className="info-item-label">{t('marketplace.input')}</div>
                <div className="info-item-value">{model.inputPrice}</div>
              </div>
              <div className="info-item">
                <div className="info-item-label">{t('marketplace.output')}</div>
                <div className="info-item-value">{model.outputPrice}</div>
              </div>
              <div className="info-item">
                <div className="info-item-label">{t('marketplace.rating')}</div>
                <div className="info-item-value">★ {model.rating}</div>
              </div>
              <div className="info-item">
                <div className="info-item-label">{t('marketplace.reviews')}</div>
                <div className="info-item-value">{model.reviews}</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

const PROVIDER_MSG_KEYS = {
  OpenAI: 'openai',
  Anthropic: 'anthropic',
  'Google DeepMind': 'googleDeepMind',
  Meta: 'meta',
};

function providerLabel(p, messages) {
  const k = PROVIDER_MSG_KEYS[p];
  if (k && messages.marketplace?.providers?.[k]) return messages.marketplace.providers[k];
  return p;
}

/* ── Inner (uses useSearchParams — must be inside Suspense) ───── */
function MarketplaceInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { t, messages } = useLocale();
  const [activeLabFilter, setActiveLabFilter] = useState('allLabs');
  const [search, setSearch]                 = useState('');
  const [activeProvider, setActiveProvider] = useState(null);
  const [activePricing, setActivePricing]   = useState(null);
  const [modalModel, setModalModel]         = useState(null);

  useEffect(() => {
    const modelId = searchParams.get('model');
    const details = searchParams.get('details');
    if (modelId && details === '1') {
      const found = MOCK_MODELS.find(m => m.id === modelId);
      if (found) setModalModel(found);
    }
  }, [searchParams]);

  const filteredModels = useMemo(() => {
    const term = search.trim().toLowerCase();
    return MOCK_MODELS.filter((model) => {
      const matchesTab = labFilterMatches(model, activeLabFilter);
      const matchesProv = !activeProvider || model.provider === activeProvider;
      if (!matchesTab || !matchesProv) return false;
      if (!term) return true;
      return [model.name, model.provider, model.description, ...model.badges]
        .join(' ').toLowerCase().includes(term);
    });
  }, [activeLabFilter, search, activeProvider]);

  const openDetails = model => {
    setModalModel(model);
    router.replace(`/marketplace?model=${model.id}&details=1`, { scroll: false });
  };

  const closeDetails = () => {
    setModalModel(null);
    router.replace('/marketplace', { scroll: false });
  };

  return (
    <main>
      <div className="app-wrapper">

        {/* ── Header ─────────────────────────────────── */}
        <header className="mk-header">
          <div>
            <h1 className="mk-title">
              <span>{t('marketplace.titleModel')} </span>
              <span className="mk-title-hl">{t('marketplace.titleHighlight')}</span>
            </h1>
            <p className="mk-sub">
              {t('marketplace.subtitle')}
            </p>
          </div>
          <div className="mk-header-meta">
            <span className="mk-pill">{t('marketplace.pillModels')}</span>
            <span className="mk-pill mk-pill-soft">{t('marketplace.pillUpdated')}</span>
          </div>
        </header>

        {/* ── Search + tabs ───────────────────────────── */}
        <section className="mk-search-row">
          <div className="mk-search-box">
            <span className="mk-search-icon">🔎</span>
            <input
              className="mk-search-input"
              type="text"
              placeholder={t('marketplace.searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="mk-filter-chips">
            {LAB_FILTER_IDS.map((fid) => (
              <button
                key={fid}
                type="button"
                className={`mk-filter-chip${activeLabFilter === fid ? ' mk-filter-chip-active' : ''}`}
                onClick={() => { setActiveLabFilter(fid); setActiveProvider(null); }}
              >
                {t(`marketplace.filters.${fid}`)}
              </button>
            ))}
          </div>
        </section>

        {/* ── Main layout ─────────────────────────────── */}
        <section className="mk-shell">

          {/* Left rail */}
          <aside className="mk-left-rail">
            <div className="mk-help-card">
              <h2>{t('marketplace.helpTitle')}</h2>
              <p>
                {t('marketplace.helpText')}
              </p>
              <button type="button" className="mk-help-btn" onClick={() => router.push('/chat-hub')}>
                {t('marketplace.openChatHub')}
              </button>
            </div>

            <div className="mk-filter-section">
              <h3>{t('marketplace.providerHeading')}</h3>
              <ul>
                {PROVIDERS.map((p) => (
                  <li key={p}>
                    <button
                      type="button"
                      className={`mk-filter-item${activeProvider === p ? ' mk-filter-item-on' : ''}`}
                      onClick={() => setActiveProvider((prev) => (prev === p ? null : p))}
                    >
                      {providerLabel(p, messages)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mk-filter-section">
              <h3>{t('marketplace.pricingHeading')}</h3>
              <ul>
                {PRICING_TYPES.map((p, i) => (
                  <li key={p}>
                    <button
                      type="button"
                      className={`mk-filter-item${activePricing === p ? ' mk-filter-item-on' : ''}`}
                      onClick={() => setActivePricing((prev) => (prev === p ? null : p))}
                    >
                      {t(`marketplace.pricingTypes.${PRICING_MSG_KEYS[i]}`)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Card grid */}
          <div className="mk-grid">
            {filteredModels.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <div className="empty-state-icon">🔍</div>
                <h3>{t('marketplace.emptyTitle')}</h3>
                <p>{t('marketplace.emptyHint')}</p>
              </div>
            ) : (
              filteredModels.map(model => (
                <MkCard key={model.id} model={model} onOpen={openDetails} />
              ))
            )}
          </div>
        </section>
      </div>

      {modalModel && <MkModal model={modalModel} onClose={closeDetails} />}
    </main>
  );
}

function MarketplaceLoading() {
  const { t } = useLocale();
  return (
    <div style={{ padding: '60px 24px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
      {t('marketplace.loading')}
    </div>
  );
}

/* ── Default export with Suspense boundary ───────────────────── */
export default function MarketplacePage() {
  return (
    <Suspense fallback={<MarketplaceLoading />}>
      <MarketplaceInner />
    </Suspense>
  );
}
