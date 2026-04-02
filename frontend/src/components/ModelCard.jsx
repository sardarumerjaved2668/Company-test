'use client';

import { useEffect, useRef } from 'react';

const ICONS = { OpenAI:'🤖', Anthropic:'🧿', Google:'♊', Meta:'🦙', 'Mistral AI':'🌪', 'Stability AI':'🎨', Midjourney:'🖼', Cohere:'🔗', Microsoft:'⊞' };
const BG    = { OpenAI:'#0d3326', Anthropic:'#3d1c0e', Google:'#0d1f3d', Meta:'#0a1e38', 'Mistral AI':'#2a1500', 'Stability AI':'#1a0a2e', Midjourney:'#2a0a0f', Cohere:'#0a2a10', Microsoft:'#001830' };
const TCLR  = { free:'tier-free', budget:'tier-budget', mid:'tier-mid', premium:'tier-premium' };
const TLBL  = { free:'Free', budget:'Budget', mid:'Standard', premium:'Premium' };
const BARS  = [
  { key:'reasoning', label:'Reasoning', cls:'fill-reasoning' },
  { key:'coding',    label:'Coding',    cls:'fill-coding'    },
  { key:'creativity',label:'Creativity',cls:'fill-creativity'},
  { key:'speed',     label:'Speed',     cls:'fill-speed'     },
];

export default function ModelCard({ model, onClick, animDelay = 0 }) {
  const barsRef = useRef([]);

  useEffect(() => {
    const t = setTimeout(() => barsRef.current.forEach((b) => b && (b.style.width = b.dataset.target + '%')), 100 + animDelay);
    return () => clearTimeout(t);
  }, [animDelay]);

  const visible = BARS.filter((s) => (model.scores?.[s.key] ?? 0) > 0);
  const pricingLabel = model.pricing.tier === 'free' ? 'Free' : model.pricing.input ? `$${model.pricing.input}/M` : TLBL[model.pricing.tier];

  return (
    <div
      className="model-card"
      style={{ animationDelay: `${animDelay}ms` }}
      onClick={() => onClick(model)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(model)}
    >
      <div className="card-glow" />
      <div className="card-header">
        <div className="card-icon" style={{ background: BG[model.provider] || '#1a2233' }}>
          {ICONS[model.provider] || '🧠'}
        </div>
        <div className="card-meta">
          <div className="card-name">{model.name}</div>
          <div className="card-provider">{model.provider}</div>
        </div>
        {model.openSource && <span className="open-source-badge">◆ Open</span>}
      </div>

      <p className="card-description">{model.description}</p>

      <div className="card-scores">
        {visible.map((s, i) => (
          <div className="score-row" key={s.key}>
            <span className="score-label">{s.label}</span>
            <div className="score-bar-track">
              <div ref={(el) => (barsRef.current[i] = el)} className={`score-bar-fill ${s.cls}`} style={{ width: '0%' }} data-target={model.scores[s.key]} />
            </div>
            <span className="score-val">{model.scores[s.key]}</span>
          </div>
        ))}
      </div>

      <div className="card-footer">
        <div className="card-categories">
          {model.categories.slice(0, 3).map((c) => <span key={c} className="cat-badge">{c}</span>)}
        </div>
        <div className="pricing-chip">
          <span className={TCLR[model.pricing.tier]}>{pricingLabel}</span>
        </div>
      </div>
    </div>
  );
}
