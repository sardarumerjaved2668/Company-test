"use client";

import { Suspense, useMemo, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "../../context/LocaleContext";
import { useMarketplace } from "../../hooks/useMarketplace";

const PROVIDER_COLORS = {
  OpenAI: "#f97316",
  Anthropic: "#d97706",
  "Google DeepMind": "#3b82f6",
  Google: "#3b82f6",
  Meta: "#8b5cf6",
  Mistral: "#ec4899",
  Cohere: "#10b981",
  Microsoft: "#2563eb",
  Amazon: "#f59e0b",
};

const TIER_TAG = {
  free: "Open Source",
  budget: "Budget",
  mid: "Popular",
  premium: "Premium",
};

const TAG_CLASSES = {
  Premium: "mkc-tag-premium",
  Budget: "mkc-tag-cost",
  Popular: "mkc-tag-popular",
  "Open Source": "mkc-tag-open",
};

const LAB_FILTER_IDS = [
  "allLabs",
  "openai",
  "anthropic",
  "googleDeepMind",
  "meta",
  "deepseek",
  "alibaba",
  "xai",
  "mistral",
  "cohere",
  "microsoft",
  "amazon",
  "baidu",
];

const LAB_FILTER_NEEDLE = {
  allLabs: null,
  openai: "openai",
  anthropic: "anthropic",
  googleDeepMind: "deepmind",
  meta: "meta",
  deepseek: "deepseek",
  alibaba: "alibaba",
  xai: "xai",
  mistral: "mistral",
  cohere: "cohere",
  microsoft: "microsoft",
  amazon: "amazon",
  baidu: "baidu",
};

const PRICING_GROUP_KEYS = ["payPerUse", "subscription", "freeTier", "enterprise"];

const CATEGORY_PILL_IDS = [
  "all",
  "language",
  "vision",
  "code",
  "imageGen",
  "audio",
  "openSource",
];

function fmtPrice(val, unit) {
  if (val == null || val === 0) return "Free";
  return `$${val} / ${unit || "1M tokens"}`;
}

function avgStarsFromScores(scores) {
  const vals = Object.values(scores || {}).filter(
    (v) => typeof v === "number" && v > 0
  );
  if (!vals.length) return null;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return ((avg / 100) * 5).toFixed(1);
}

function syntheticReviews(m) {
  const base = (m._id || m.slug || m.name || "").toString();
  let h = 0;
  for (let i = 0; i < base.length; i++) h = (h * 31 + base.charCodeAt(i)) | 0;
  return 800 + Math.abs(h % 4200);
}

function normalizeModel(m) {
  const scores = m.scores || {};
  const starRating = avgStarsFromScores(scores);
  const vals = Object.values(scores).filter(
    (v) => typeof v === "number" && v > 0
  );
  const scoreAvg = vals.length
    ? vals.reduce((a, b) => a + b, 0) / vals.length
    : 0;
  const isHot = scoreAvg >= 88;

  return {
    id: m.slug || String(m._id),
    _id: m._id,
    name: m.name,
    provider: m.provider,
    categories: m.categories || [],
    description: m.description,
    inputPrice: fmtPrice(m.pricing?.input, m.pricing?.unit),
    outputPrice: fmtPrice(m.pricing?.output, m.pricing?.unit),
    tag: TIER_TAG[m.pricing?.tier] || "Popular",
    tierKey: m.pricing?.tier || "mid",
    openSource: m.openSource,
    apiAvailable: m.apiAvailable,
    scores,
    strengths: m.strengths || [],
    limitations: m.limitations || [],
    contextWindow: m.contextWindow,
    releaseDate: m.releaseDate,
    providerColor: m.providerColor,
    researchOnly: !!m.researchOnly,
    starRating,
    reviewCount: syntheticReviews(m),
    isHot,
  };
}

function ScoreBar({ label, value }) {
  if (value == null) return null;
  const pct = Math.round(value);
  const color = pct >= 80 ? "#22c55e" : pct >= 60 ? "#3b82f6" : "#f59e0b";
  return (
    <div className="mkc-score-row">
      <span className="mkc-score-lbl">{label}</span>
      <div className="mkc-score-track">
        <div
          className="mkc-score-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="mkc-score-val">{pct}</span>
    </div>
  );
}

const SCORE_LABELS = {
  reasoning: "Reasoning",
  coding: "Coding",
  creativity: "Creativity",
  speed: "Speed",
  multimodal: "Multimodal",
  contextHandling: "Context",
  costEfficiency: "Cost eff.",
};

function MkCard({ model, onOpen }) {
  const { messages } = useLocale();
  const color =
    PROVIDER_COLORS[model.provider] || model.providerColor || "#C8622A";
  const tagCls = TAG_CLASSES[model.tag] || "mkc-tag-popular";
  const tagLabel = messages.marketplace?.tags?.[model.tag] || model.tag;
  const topScores = Object.entries(model.scores || {})
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <article
      className="mkc-card"
      onClick={() => onOpen(model)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpen(model)}
    >
      <div className="mkc-head">
        <div className="mkc-icon" style={{ background: `${color}18`, color }}>
          {model.name?.charAt(0) || "⚡"}
        </div>
        <div className="mkc-meta">
          <div className="mkc-name">{model.name}</div>
          <div className="mkc-prov">{model.provider}</div>
        </div>
        <div className="mkc-tags-col">
          {model.isHot && (
            <span className="mkc-tag mkc-tag-hot">
              {messages.marketplace?.hotBadge || "Hot"}
            </span>
          )}
          <span className={`mkc-tag ${tagCls}`}>{tagLabel}</span>
          {model.openSource && <span className="mkc-badge-open">Open</span>}
        </div>
      </div>

      <p className="mkc-desc">{model.description}</p>

      <div className="mkc-chips">
        {model.categories.slice(0, 4).map((b) => (
          <span key={b} className="mkc-chip">
            {b}
          </span>
        ))}
      </div>

      {topScores.length > 0 && (
        <div className="mkc-scores">
          {topScores.map(([key, val]) => (
            <ScoreBar key={key} label={SCORE_LABELS[key] || key} value={val} />
          ))}
        </div>
      )}

      {model.starRating && (
        <div className="mkc-rating-row">
          <span className="mkc-stars" aria-hidden="true">
            ★★★★★
          </span>
          <span className="mkc-rating-num">{model.starRating}</span>
          <span className="mkc-rating-count">
            ({Number(model.reviewCount).toLocaleString()}{" "}
            {messages.marketplace?.reviews || "reviews"})
          </span>
        </div>
      )}

      <div className="mkc-foot">
        <div className="mkc-foot-prices">
          <div className="mkc-price-row">
            <span className="mkc-price-label">In</span>
            <span className="mkc-price-val">{model.inputPrice}</span>
            <span className="mkc-price-sep">·</span>
            <span className="mkc-price-label">Out</span>
            <span className="mkc-price-val">{model.outputPrice}</span>
          </div>
          {model.contextWindow && (
            <span className="mkc-ctx">
              {(model.contextWindow / 1000).toFixed(0)}K ctx
            </span>
          )}
        </div>
        <span className="mkc-howto">
          {messages.marketplace?.howToUse || "How to use"} →
        </span>
      </div>
    </article>
  );
}

function MkModal({ model, onClose }) {
  const { t } = useLocale();
  const color =
    PROVIDER_COLORS[model.provider] || model.providerColor || "#C8622A";
  const tagCls = TAG_CLASSES[model.tag] || "mkc-tag-popular";

  return (
    <div
      className="modal-overlay open"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-panel">
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="modal-body">
          <div className="modal-hero">
            <div
              className="modal-icon"
              style={{
                background: `${color}18`,
                color,
                fontSize: 28,
              }}
            >
              {model.name?.charAt(0) || "⚡"}
            </div>
            <div className="modal-title-group">
              <h2 className="modal-model-name">{model.name}</h2>
              <div className="modal-provider-row">
                <span className="modal-provider-name">by {model.provider}</span>
                <span className={`mkc-tag ${tagCls}`}>{model.tag}</span>
                {model.openSource && (
                  <span className="mkc-badge-open">Open Source</span>
                )}
                {model.apiAvailable && (
                  <span className="modal-badge badge-api">
                    {t("marketplace.apiAvailable")}
                  </span>
                )}
              </div>
            </div>
          </div>

          <section className="modal-section">
            <h3 className="modal-section-title">{t("marketplace.aboutModel")}</h3>
            <p className="modal-description">{model.description}</p>
          </section>

          <section className="modal-section">
            <h3 className="modal-section-title">{t("marketplace.capabilities")}</h3>
            <div className="modal-categories">
              {model.categories.map((b) => (
                <span key={b} className="modal-cat-badge">
                  {b}
                </span>
              ))}
            </div>
          </section>

          {Object.values(model.scores || {}).some((v) => v > 0) && (
            <section className="modal-section">
              <h3 className="modal-section-title">Capability Scores</h3>
              <div className="modal-scores-grid">
                {Object.entries(model.scores)
                  .filter(([, v]) => v > 0)
                  .map(([key, val]) => (
                    <div key={key} className="modal-score-item">
                      <div className="modal-score-top">
                        <span className="modal-score-lbl">
                          {SCORE_LABELS[key] || key}
                        </span>
                        <span className="modal-score-num">{val}</span>
                      </div>
                      <div className="modal-score-track">
                        <div
                          className="modal-score-fill"
                          style={{
                            width: `${val}%`,
                            background:
                              val >= 80
                                ? "#22c55e"
                                : val >= 60
                                  ? "#3b82f6"
                                  : "#f59e0b",
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}

          <section className="modal-section">
            <h3 className="modal-section-title">{t("marketplace.pricing")}</h3>
            <div className="info-grid">
              <div className="info-item">
                <div className="info-item-label">Input</div>
                <div className="info-item-value">{model.inputPrice}</div>
              </div>
              <div className="info-item">
                <div className="info-item-label">Output</div>
                <div className="info-item-value">{model.outputPrice}</div>
              </div>
              {model.contextWindow && (
                <div className="info-item">
                  <div className="info-item-label">Context window</div>
                  <div className="info-item-value">
                    {model.contextWindow.toLocaleString()} tokens
                  </div>
                </div>
              )}
              {model.releaseDate && (
                <div className="info-item">
                  <div className="info-item-label">Released</div>
                  <div className="info-item-value">{model.releaseDate}</div>
                </div>
              )}
            </div>
          </section>

          {(model.strengths.length > 0 || model.limitations.length > 0) && (
            <section className="modal-section">
              <div className="pros-cons-grid">
                {model.strengths.length > 0 && (
                  <div>
                    <div className="pros-title">✓ Strengths</div>
                    <ul className="pros-list">
                      {model.strengths.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {model.limitations.length > 0 && (
                  <div>
                    <div className="cons-title">× Limitations</div>
                    <ul className="cons-list">
                      {model.limitations.map((l) => (
                        <li key={l}>{l}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function labCountForFilter(filterId, stats) {
  if (!stats?.byProvider?.length) return null;
  if (filterId === "allLabs") return stats.total;
  const needle = LAB_FILTER_NEEDLE[filterId];
  if (!needle) return 0;
  const row = stats.byProvider.find((b) =>
    (b.provider || "").toLowerCase().includes(needle)
  );
  return row ? row.count : 0;
}

function MarketplaceInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, messages } = useLocale();
  const mp = useMarketplace();

  const {
    rawModels,
    filteredRawModels,
    loading,
    error,
    stats,
    tabCounts,
    agents,
    agentsLoading,
    searchInput,
    setSearchInput,
    categoryMode,
    setCategoryMode,
    selectedProviders,
    toggleProvider,
    pricingGroups,
    togglePricingGroup,
    licence,
    toggleLicence,
    maxInputPrice,
    setMaxInputPrice,
    minRating,
    setMinRating,
    labProvider,
    setLabProvider,
    clearSelectedProviders,
    clearAllFilters,
  } = mp;

  const [activeLabFilter, setActiveLabFilter] = useState("allLabs");
  const [modalModel, setModalModel] = useState(null);

  const filteredModels = useMemo(
    () => filteredRawModels.map(normalizeModel),
    [filteredRawModels]
  );

  const providerRows = useMemo(() => {
    const list = stats.byProvider?.length
      ? [...stats.byProvider].sort((a, b) =>
          (a.provider || "").localeCompare(b.provider || "")
        )
      : [];
    if (list.length) return list.map((r) => r.provider);
    return [...new Set(rawModels.map((m) => m.provider))].sort();
  }, [stats.byProvider, rawModels]);

  const pickLab = useCallback(
    (fid) => {
      setActiveLabFilter(fid);
      clearSelectedProviders();
      if (fid === "allLabs") {
        setLabProvider(null);
        return;
      }
      const needle = LAB_FILTER_NEEDLE[fid];
      const row = stats.byProvider?.find((b) =>
        (b.provider || "").toLowerCase().includes(needle)
      );
      setLabProvider(row ? row.provider : null);
    },
    [stats.byProvider, setLabProvider, clearSelectedProviders]
  );

  const onToggleProvider = useCallback(
    (name) => {
      toggleProvider(name);
      setLabProvider(null);
      setActiveLabFilter("allLabs");
    },
    [toggleProvider, setLabProvider]
  );

  const onClearFilters = useCallback(() => {
    clearAllFilters();
    setActiveLabFilter("allLabs");
  }, [clearAllFilters]);

  const activeLabLabel = labProvider;

  useEffect(() => {
    const modelId = searchParams.get("model");
    if (!modelId || searchParams.get("details") !== "1" || rawModels.length === 0) {
      return;
    }
    const raw = rawModels.find(
      (m) => String(m.slug || m._id || "") === modelId
    );
    if (raw) setModalModel(normalizeModel(raw));
  }, [searchParams, rawModels]);

  const openDetails = (model) => {
    setModalModel(model);
    router.replace(`/marketplace?model=${model.id}&details=1`, {
      scroll: false,
    });
  };

  const closeDetails = () => {
    setModalModel(null);
    router.replace("/marketplace", { scroll: false });
  };

  const pricingGroupLabel = (key) =>
    messages.marketplace?.pricingGroups?.[key] || key;

  return (
    <main className="mk-page mk-full-bleed">
      <div className="mk-page-inner mk-app-full">
        <header className="mk-header">
          <div>
            <h1 className="mk-title">
              <span>{t("marketplace.titleModel")} </span>
              <span className="mk-title-hl">{t("marketplace.titleHighlight")}</span>
            </h1>
            <p className="mk-sub">{t("marketplace.subtitle")}</p>
          </div>
          <div className="mk-header-meta">
            {!loading && (
              <span className="mk-pill">
                {filteredModels.length}{" "}
                {messages.marketplace?.modelsCountLabel || "models"}
              </span>
            )}
            <span className="mk-pill mk-pill-soft">{t("marketplace.pillUpdated")}</span>
          </div>
        </header>

        <section className="mk-search-toolbar" aria-label="Search and filters">
          <div className="mk-search-strip">
            <div className="mk-search-strip-search">
              <input
                className="mk-search-input mk-search-input-strip"
                type="search"
                placeholder={t("marketplace.searchPlaceholder")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                autoComplete="off"
                aria-label={t("marketplace.searchPlaceholder")}
              />
            </div>

            <div className="mk-category-pills" role="tablist" aria-label={t("marketplace.categoryTablist")}>
            {CATEGORY_PILL_IDS.map((id) => {
              const active =
                id === "all"
                  ? !categoryMode
                  : categoryMode === id;
              const n = tabCounts?.[id];
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`mk-cat-pill${active ? " mk-cat-pill-active" : ""}${id === "openSource" ? " mk-cat-pill-accent" : ""}`}
                  onClick={() =>
                    setCategoryMode(id === "all" ? null : id)
                  }
                >
                  <span>{t(`marketplace.categoryPills.${id}`)}</span>
                  {typeof n === "number" && (
                    <span className="mk-cat-pill-count">({n})</span>
                  )}
                </button>
              );
            })}
            </div>
          </div>

          <div className="mk-lab-carousel-wrap">
            <div className="mk-lab-carousel" role="list">
              {LAB_FILTER_IDS.map((fid) => {
                const active = activeLabFilter === fid;
                const cnt = labCountForFilter(fid, stats);
                return (
                  <button
                    key={fid}
                    type="button"
                    role="listitem"
                    className={`mk-lab-chip${active ? " mk-lab-chip-active" : ""}`}
                    onClick={() => pickLab(fid)}
                  >
                    <span className="mk-lab-dot" />
                    <span className="mk-lab-label">
                      {t(`marketplace.filters.${fid}`)}
                    </span>
                    {cnt != null && (
                      <span className="mk-lab-count">({cnt})</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {labProvider && (
          <div className="mk-active-filter" role="status">
            <span>
              {messages.marketplace?.showingFrom || "Showing models from"}{" "}
              <strong>{activeLabLabel || ""}</strong>
            </span>
            <button type="button" className="mk-active-filter-clear" onClick={onClearFilters}>
              {messages.marketplace?.clearFilter || "Clear filter"}
            </button>
          </div>
        )}

        <section className="mk-shell">
          <aside className="mk-left-rail">
            <div className="mk-help-card">
              <h2>{t("marketplace.helpTitle")}</h2>
              <p>{t("marketplace.helpText")}</p>
              {!agentsLoading && agents.length > 0 && (
                <p className="mk-help-meta">
                  {agents.length}{" "}
                  {messages.marketplace?.agentTemplates || "agent templates"}
                </p>
              )}
              <Link href="/chat-hub" className="mk-help-btn">
                {t("marketplace.openChatHub")}
              </Link>
            </div>

            <div className="mk-filter-section">
              <h3>{t("marketplace.providerHeading")}</h3>
              <ul className="mk-cb-list">
                {providerRows.map((p) => (
                  <li key={p}>
                    <label className="mk-cb">
                      <input
                        type="checkbox"
                        checked={selectedProviders.has(p)}
                        onChange={() => onToggleProvider(p)}
                      />
                      <span>{p}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mk-filter-section">
              <h3>{messages.marketplace?.pricingHeadingUi || "PRICING MODEL"}</h3>
              <ul className="mk-cb-list">
                {PRICING_GROUP_KEYS.map((key) => (
                  <li key={key}>
                    <label className="mk-cb">
                      <input
                        type="checkbox"
                        checked={pricingGroups.has(key)}
                        onChange={() => togglePricingGroup(key)}
                      />
                      <span>{pricingGroupLabel(key)}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mk-filter-section">
              <h3>{messages.marketplace?.maxPriceHeading || "MAX PRICE / 1M TOKENS"}</h3>
              <input
                type="range"
                className="mk-range mk-range-orange"
                min={0}
                max={100}
                step={1}
                value={maxInputPrice}
                onChange={(e) => setMaxInputPrice(Number(e.target.value))}
              />
              <div className="mk-range-val">
                {maxInputPrice >= 100
                  ? messages.marketplace?.upTo100 || "Up to $100"
                  : `${messages.marketplace?.upToPrefix || "Up to"} $${maxInputPrice}`}
              </div>
            </div>

            <div className="mk-filter-section">
              <h3>{messages.marketplace?.minRatingHeading || "MIN RATING"}</h3>
              <div className="mk-rating-chips">
                <button
                  type="button"
                  className={`mk-mini-chip${minRating === 0 ? " mk-mini-chip-on" : ""}`}
                  onClick={() => setMinRating(0)}
                >
                  {messages.marketplace?.ratingAny || "Any"}
                </button>
                <button
                  type="button"
                  className={`mk-mini-chip${minRating === 4 ? " mk-mini-chip-on" : ""}`}
                  onClick={() => setMinRating(4)}
                >
                  4+ <span className="mk-star">★</span>
                </button>
                <button
                  type="button"
                  className={`mk-mini-chip${minRating === 4.5 ? " mk-mini-chip-on" : ""}`}
                  onClick={() => setMinRating(4.5)}
                >
                  4.5+ <span className="mk-star">★</span>
                </button>
              </div>
            </div>

            <div className="mk-filter-section">
              <h3>{messages.marketplace?.licenceHeading || "LICENCE"}</h3>
              <ul className="mk-cb-list">
                {["commercial", "openSource", "researchOnly"].map((key) => (
                  <li key={key}>
                    <label className="mk-cb">
                      <input
                        type="checkbox"
                        checked={licence.has(key)}
                        onChange={() => toggleLicence(key)}
                      />
                      <span>
                        {messages.marketplace?.licence?.[key] || key}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mk-filter-section mk-quick-guides">
              <h3>{messages.marketplace?.quickGuidesHeading || "QUICK GUIDES"}</h3>
              <div className="mk-guide-btns">
                <Link href="/chat-hub" className="mk-guide-btn">
                  <span className="mk-guide-ico" aria-hidden="true">📐</span>
                  {messages.marketplace?.guidePrompt || "Prompt engineering tips"}
                </Link>
                <Link href="/agents" className="mk-guide-btn">
                  <span className="mk-guide-ico" aria-hidden="true">🤖</span>
                  {messages.marketplace?.guideAgent || "Agent creation guide"}
                </Link>
                <Link href="/marketplace" className="mk-guide-btn" scroll={false}>
                  <span className="mk-guide-ico" aria-hidden="true">💰</span>
                  {messages.marketplace?.guidePricing || "Pricing comparison"}
                </Link>
              </div>
            </div>
          </aside>

          <div className="mk-grid-wrap">
            <div className="mk-grid mk-grid-dense">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="card-skeleton" />
                ))
              ) : error ? (
                <div className="empty-state" style={{ gridColumn: "1/-1" }}>
                  <div className="empty-state-icon">⚠️</div>
                  <h3>Failed to load models</h3>
                  <p style={{ maxWidth: 520, margin: "0 auto" }}>{error}</p>
                </div>
              ) : filteredModels.length === 0 && rawModels.length === 0 ? (
                <div className="empty-state" style={{ gridColumn: "1/-1" }}>
                  <div className="empty-state-icon">📭</div>
                  <h3>{t("marketplace.emptyTitle")}</h3>
                  <p>{t("marketplace.emptyDbHint")}</p>
                </div>
              ) : filteredModels.length === 0 ? (
                <div className="empty-state" style={{ gridColumn: "1/-1" }}>
                  <div className="empty-state-icon">🔍</div>
                  <h3>{t("marketplace.emptyTitle")}</h3>
                  <p>{t("marketplace.emptyHint")}</p>
                </div>
              ) : (
                filteredModels.map((model) => (
                  <MkCard key={model.id} model={model} onOpen={openDetails} />
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      {modalModel && <MkModal model={modalModel} onClose={closeDetails} />}
    </main>
  );
}

function MarketplaceLoading() {
  return (
    <div className="mk-page-loading">
      <div className="auth-spinner" />
      <p>Loading…</p>
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<MarketplaceLoading />}>
      <MarketplaceInner />
    </Suspense>
  );
}
