'use client';

import { useEffect, useRef } from 'react';

const ICONS = { OpenAI:'🤖', Anthropic:'🧿', Google:'♊', Meta:'🦙', 'Mistral AI':'🌪', 'Stability AI':'🎨', Midjourney:'🖼', Cohere:'🔗', Microsoft:'⊞' };
const BG    = { OpenAI:'#0d3326', Anthropic:'#3d1c0e', Google:'#0d1f3d', Meta:'#0a1e38', 'Mistral AI':'#2a1500', 'Stability AI':'#1a0a2e', Midjourney:'#2a0a0f', Cohere:'#0a2a10', Microsoft:'#001830' };
const TCLR  = { free:'tier-free', budget:'tier-budget', mid:'tier-mid', premium:'tier-premium' };
const CAPS  = [
  { key:'reasoning',      label:'Reasoning',     icon:'🧠', cls:'fill-modal-reasoning' },
  { key:'coding',         label:'Coding',         icon:'💻', cls:'fill-modal-coding'    },
  { key:'creativity',     label:'Creativity',     icon:'✨', cls:'fill-modal-creativity'},
  { key:'speed',          label:'Speed',          icon:'⚡', cls:'fill-modal-speed'     },
  { key:'multimodal',     label:'Multimodal',     icon:'👁', cls:'fill-modal-multimodal'},
  { key:'contextHandling',label:'Long Context',   icon:'📄', cls:'fill-modal-context'   },
  { key:'costEfficiency', label:'Cost Efficiency',icon:'💰', cls:'fill-modal-cost'      },
];

export default function ModelModal({ model, onClose }) {
  const barsRef = useRef([]);
  const overlayRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => barsRef.current.forEach((b) => b && (b.style.width = b.dataset.target + '%')), 120);
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { clearTimeout(t); document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  if (!model) return null;

  const visible = CAPS.filter((c) => (model.scores?.[c.key] ?? 0) > 0);
  const ctxStr = model.contextWindow
    ? model.contextWindow >= 1000000 ? `${(model.contextWindow/1000000).toFixed(0)}M tokens` : `${(model.contextWindow/1000).toFixed(0)}K tokens`
    : 'N/A';
  const pricingStr = model.pricing.tier === 'free' ? 'Free / Open Source' : model.pricing.input ? `$${model.pricing.input} ${model.pricing.unit}` : 'Subscription';

  return (
    <div className="modal-overlay open" ref={overlayRef} onClick={(e) => e.target === overlayRef.current && onClose()} role="dialog" aria-modal="true">
      <div className="modal-panel">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-body">

          <div className="modal-hero">
            <div className="modal-icon" style={{ background: BG[model.provider] || '#1a2233' }}>{ICONS[model.provider] || '🧠'}</div>
            <div className="modal-title-group">
              <div className="modal-model-name gradient-text">{model.name}</div>
              <div className="modal-provider-row">
                <span className="modal-provider-name">by {model.provider}</span>
                {model.openSource && <span className="modal-badge badge-open">◆ Open Source</span>}
                {model.apiAvailable ? <span className="modal-badge badge-api">API Available</span> : <span className="modal-badge badge-no-api">No API</span>}
              </div>
            </div>
          </div>

          <div className="modal-section">
            <div className="modal-section-title">About</div>
            <p className="modal-description">{model.description}</p>
          </div>

          <div className="modal-section">
            <div className="modal-section-title">Capability Scores</div>
            <div className="capability-bars">
              {visible.map((c, i) => (
                <div className="cap-bar-row" key={c.key}>
                  <div className="cap-bar-label"><span className="cap-bar-icon">{c.icon}</span>{c.label}</div>
                  <div className="cap-bar-track">
                    <div ref={(el) => (barsRef.current[i] = el)} className={`cap-bar-fill ${c.cls}`} style={{ width: '0%' }} data-target={model.scores[c.key]} />
                  </div>
                  <div className="cap-bar-val">{model.scores[c.key]}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-section">
            <div className="modal-section-title">Technical Details</div>
            <div className="info-grid">
              <div className="info-item"><div className="info-item-label">Context Window</div><div className="info-item-value">{ctxStr}</div></div>
              <div className="info-item"><div className="info-item-label">Pricing</div><div className={`info-item-value ${TCLR[model.pricing.tier]}`} style={{fontSize:13}}>{pricingStr}</div></div>
              <div className="info-item"><div className="info-item-label">Release</div><div className="info-item-value">{model.releaseDate || 'N/A'}</div></div>
              <div className="info-item"><div className="info-item-label">Provider</div><div className="info-item-value" style={{fontSize:13}}>{model.provider}</div></div>
            </div>
          </div>

          <div className="modal-section">
            <div className="modal-section-title">Strengths & Limitations</div>
            <div className="pros-cons-grid">
              <div className="pros-box">
                <div className="pros-title"><span>▲</span> Strengths</div>
                <ul className="pros-list">{(model.strengths||[]).map((s,i)=><li key={i}>{s}</li>)}</ul>
              </div>
              <div className="cons-box">
                <div className="cons-title"><span>▼</span> Limitations</div>
                <ul className="cons-list">{(model.limitations||[]).map((l,i)=><li key={i}>{l}</li>)}</ul>
              </div>
            </div>
          </div>

          <div className="modal-section">
            <div className="modal-section-title">Categories</div>
            <div className="modal-categories">{(model.categories||[]).map((c)=><span key={c} className="modal-cat-badge">{c}</span>)}</div>
          </div>

        </div>
      </div>
    </div>
  );
}
