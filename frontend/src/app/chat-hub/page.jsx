'use client';

import { useState, useRef, useEffect } from 'react';
import ModelModal from '../../components/ModelModal';
import { useModels } from '../../hooks/useModels';
import { useRecommendation } from '../../hooks/useRecommendation';

/* ── Static data ────────────────────────────────────────────── */
const ACTION_CARDS = [
  { icon: '✏️', label: 'Write content',   desc: 'Emails, posts, stories',    prompt: 'Write long-form content, emails, and social posts in my tone.' },
  { icon: '🎨', label: 'Create images',   desc: 'Art, photos, designs',      prompt: 'Create high quality images and artwork for my brand and product visuals.' },
  { icon: '🔨', label: 'Build something', desc: 'Apps, tools, websites',     prompt: 'Help me build an app, tool, or website from scratch using AI.' },
  { icon: '⚡', label: 'Automate work',   desc: 'Save hours every week',     prompt: 'Help me automate repetitive tasks and workflows to save time.' },
  { icon: '📊', label: 'Analyse data',    desc: 'PDFs, sheets, reports',     prompt: 'Analyse a dataset and surface insights, trends, and anomalies.' },
  { icon: '🔭', label: 'Just exploring',  desc: "Show me what's possible",   prompt: 'I am just exploring what AI models can do for me.' },
];

const CATEGORY_TABS = [
  { key: 'use_cases',  label: 'Use cases' },
  { key: 'monitor',    label: 'Monitor the situation' },
  { key: 'prototype',  label: 'Create a prototype' },
  { key: 'business',   label: 'Build a business plan' },
  { key: 'content',    label: 'Create content' },
  { key: 'research',   label: 'Analyze & research' },
  { key: 'learn',      label: 'Learn something' },
];

const TAB_PROMPTS = {
  use_cases: [
    'Help me find the best AI model for my project',
    'I want to build an AI chatbot for my website',
    'Generate realistic images for my marketing campaign',
    'Analyse documents and extract key information',
    'Create AI agents for workflow automation',
    'Add voice and speech recognition to my app',
  ],
  monitor: [
    'Set up real-time monitoring for my application',
    'Track performance metrics and send alerts',
    'Monitor social media sentiment for my brand',
    'Create a system health dashboard with AI',
    'Detect anomalies in my data streams',
    'Build an alert system for key business metrics',
  ],
  prototype: [
    'Build a quick prototype for my app idea',
    'Create a clickable mockup for my product',
    'Generate a working demo from my concept',
    'Scaffold a basic web app in minutes',
    'Prototype a conversational AI interface',
    'Build a no-code MVP with AI assistance',
  ],
  business: [
    'Create a comprehensive business plan for my startup',
    'Develop a go-to-market strategy',
    'Write a competitive analysis report',
    'Build a financial projection model',
    'Generate investor pitch deck content',
    'Draft a product roadmap document',
  ],
  content: [
    'Write a blog post about AI trends',
    'Create engaging social media copy',
    'Generate product descriptions at scale',
    'Draft a press release for my launch',
    'Write email marketing sequences',
    'Create video scripts and storyboards',
  ],
  research: [
    'Summarise the latest research on machine learning',
    'Analyse a dataset and find key insights',
    'Compare different AI models for my use case',
    'Extract key points from multiple documents',
    'Research competitors and market trends',
    'Generate a literature review on a topic',
  ],
  learn: [
    'Explain how large language models work',
    'Teach me prompt engineering best practices',
    'Create a study plan for learning AI development',
    'Give me a crash course on neural networks',
    'Explain the difference between AI model types',
    'Help me understand AI ethics and safety',
  ],
};

const QUICK_ACTIONS = [
  {
    section: 'NAVIGATION & TOOLS',
    items: [
      { icon: '🛍',  label: 'Browse Marketplace',  bg: '#fef3c7' },
      { icon: '🤖',  label: 'Build an Agent',       bg: '#ede9fe' },
      { icon: '📖',  label: 'How to use Guide',     bg: '#dbeafe' },
      { icon: '✨',  label: 'Prompt Engineering',   bg: '#fff7ed' },
      { icon: '💰',  label: 'View Pricing',         bg: '#fef9c3' },
      { icon: '📊',  label: 'AI Models Analysis',   bg: '#dcfce7' },
    ],
  },
  {
    section: 'CREATE & GENERATE',
    items: [
      { icon: '🎨',  label: 'Create image',         bg: '#fff7ed' },
      { icon: '🎵',  label: 'Generate Audio',        bg: '#fce7f3' },
      { icon: '🎬',  label: 'Create video',          bg: '#ede9fe' },
      { icon: '📑',  label: 'Create slides',         bg: '#dcfce7' },
      { icon: '📈',  label: 'Create Infographs',     bg: '#fef3c7' },
      { icon: '❓',  label: 'Create quiz',           bg: '#fee2e2' },
      { icon: '🗂️', label: 'Create Flashcards',     bg: '#fff7ed' },
      { icon: '🧠',  label: 'Create Mind map',       bg: '#ede9fe' },
    ],
  },
  {
    section: 'ANALYZE & WRITE',
    items: [
      { icon: '📉',  label: 'Analyze Data',          bg: '#dcfce7' },
      { icon: '✍️', label: 'Write content',          bg: '#fff7ed' },
      { icon: '💻',  label: 'Code Generation',       bg: '#dbeafe' },
      { icon: '📄',  label: 'Document Analysis',     bg: '#ede9fe' },
      { icon: '🌐',  label: 'Translate',             bg: '#dbeafe' },
    ],
  },
];

const MODEL_COLORS = [
  '#ec4899','#a855f7','#f59e0b','#eab308','#3b82f6',
  '#f97316','#ea580c','#d97706','#7c3aed','#0891b2',
  '#ca8a04','#10a37f','#16a34a','#2563eb','#db2777',
  '#9333ea','#0284c7','#dc2626','#65a30d','#0d9488',
];

function getModelColor(i) { return MODEL_COLORS[i % MODEL_COLORS.length]; }

/* ── Page Component ─────────────────────────────────────────── */
export default function ChatHubPage() {
  const { models, loading: modelsLoading } = useModels();
  const { recommend }                       = useRecommendation();

  const [selectedModel, setSelectedModel]       = useState(null);
  const [activeModelIndex, setActiveModelIndex] = useState(0);
  const [modelSearch, setModelSearch]           = useState('');
  const [chatMessages, setChatMessages]         = useState([]);
  const [chatInput, setChatInput]               = useState('');
  const [activeTab, setActiveTab]               = useState('use_cases');
  const [isTyping, setIsTyping]                 = useState(false);
  const [sessions, setSessions]                 = useState([]);

  const chatEndRef  = useRef(null);
  const textareaRef = useRef(null);

  const activeModel = models[activeModelIndex] || null;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  /* Auto-resize textarea */
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }, [chatInput]);

  const filteredModels = models.filter(m =>
    !modelSearch ||
    m.name?.toLowerCase().includes(modelSearch.toLowerCase()) ||
    m.provider?.toLowerCase().includes(modelSearch.toLowerCase())
  );

  const handleResults = (results, query) => {
    setSessions(prev => [
      { id: Date.now(), query, createdAt: new Date().toISOString(), results },
      ...prev,
    ]);
  };

  const sendMessage = (text) => {
    const trimmed = (text ?? chatInput).trim();
    if (!trimmed) return;

    setChatMessages(prev => [...prev, { id: Date.now(), role: 'user', text: trimmed }]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      let botText;
      if (models && models.length > 0) {
        const results = recommend(trimmed, models);
        handleResults(results, trimmed);
        const names = results.slice(0, 3).map(r => r.model?.name).filter(Boolean);
        botText = names.length
          ? `Great question! I found ${results.length} strong matches: ${names.join(', ')}. The top pick is ${names[0]} with a ${results[0].matchPercentage}% match score. Click any model in the sidebar to learn more!`
          : "I couldn't find strong matches for that query. Try mentioning what you want to create — like \"generate images\", \"write code\", \"transcribe audio\", or \"translate content\".";
      } else {
        botText = 'Tell me more about your project and I\'ll recommend the best AI models for your needs!';
      }
      setIsTyping(false);
      setChatMessages(prev => [...prev, { id: Date.now(), role: 'bot', text: botText }]);
    }, 700);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const currentPrompts = TAB_PROMPTS[activeTab] || TAB_PROMPTS.use_cases;

  return (
    <div className="nxc-page">
      <div className="nxc-shell">

        {/* ── LEFT SIDEBAR ─────────────────────────── */}
        <aside className="nxc-sidebar">
          <div className="nxc-sb-hd">MODELS</div>

          <div className="nxc-sb-search-wrap">
            <div className="nxc-sb-search-box">
              <span className="nxc-sb-search-ico">🔍</span>
              <input
                className="nxc-sb-search"
                placeholder="Search 525 models..."
                value={modelSearch}
                onChange={e => setModelSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="nxc-model-list">
            {modelsLoading ? (
              <p className="nxc-sb-empty">Loading models…</p>
            ) : filteredModels.length === 0 ? (
              <p className="nxc-sb-empty">No models found</p>
            ) : (
              filteredModels.map((model, i) => (
                <button
                  key={model._id || i}
                  type="button"
                  className={`nxc-model-row${activeModelIndex === i ? ' nxc-model-row-on' : ''}`}
                  onClick={() => setActiveModelIndex(i)}
                >
                  <span
                    className="nxc-model-ico"
                    style={{ background: getModelColor(i) }}
                  >
                    {model.name ? model.name.charAt(0) : 'M'}
                  </span>
                  <span className="nxc-model-meta">
                    <span className="nxc-model-nm">{model.name}</span>
                    <span className="nxc-model-pv">
                      <span className="nxc-dot-live" />
                      {model.provider}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* ── CENTER MAIN ──────────────────────────── */}
        <main className="nxc-main">

          {/* Scrollable chat / welcome area */}
          <div className="nxc-chat-area">
            {chatMessages.length === 0 && !isTyping ? (

              /* Welcome card */
              <div className="nxc-welcome-wrap">
                <div className="nxc-welcome-card">
                  <div className="nxc-welcome-av">✦</div>

                  <h2 className="nxc-welcome-ttl">
                    Welcome! I&apos;m here to help you 👋
                  </h2>
                  <p className="nxc-welcome-sub">
                    No tech background needed. Tell me what you&apos;d like to{' '}
                    <strong>achieve</strong> — I&apos;ll help you discover what&apos;s
                    possible, step by step.
                  </p>

                  <div className="nxc-action-box">
                    <div className="nxc-action-lbl">
                      <span className="nxc-action-star">✦</span>
                      {' '}WHAT WOULD YOU LIKE TO DO TODAY?
                    </div>
                    <div className="nxc-action-grid">
                      {ACTION_CARDS.map(card => (
                        <button
                          key={card.label}
                          type="button"
                          className="nxc-action-card"
                          onClick={() => sendMessage(card.prompt)}
                        >
                          <span className="nxc-ac-ico">{card.icon}</span>
                          <span className="nxc-ac-lbl">{card.label}</span>
                          <span className="nxc-ac-desc">{card.desc}</span>
                        </button>
                      ))}
                    </div>
                    <p className="nxc-action-hint">
                      Or type anything below — there are no wrong answers ↓
                    </p>
                  </div>
                </div>
              </div>

            ) : (

              /* Message thread */
              <div className="nxc-messages">
                {chatMessages.map(m => (
                  <div key={m.id} className={`nxc-msg${m.role === 'user' ? ' nxc-msg-u' : ' nxc-msg-b'}`}>
                    {m.role === 'bot' && <div className="nxc-av nxc-av-bot">✦</div>}
                    <div className="nxc-bubble">{m.text}</div>
                    {m.role === 'user' && <div className="nxc-av nxc-av-user">U</div>}
                  </div>
                ))}

                {isTyping && (
                  <div className="nxc-msg nxc-msg-b">
                    <div className="nxc-av nxc-av-bot">✦</div>
                    <div className="nxc-bubble nxc-typing">
                      <span /><span /><span />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* ── Input area (sticky bottom) ─────────── */}
          <div className="nxc-input-area">

            {/* Text input */}
            <div className="nxc-inp-wrap">
              <textarea
                ref={textareaRef}
                className="nxc-inp-ta"
                placeholder="Describe your project, ask a question, or just say hi — I'm here to help..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
            </div>

            {/* Tool bar */}
            <div className="nxc-inp-bar">
              <div className="nxc-tools">
                <button type="button" className="nxc-tool" title="Voice">🎙️</button>
                <button type="button" className="nxc-tool" title="Attach">📎</button>
                <button type="button" className="nxc-tool" title="Video">🎥</button>
                <button type="button" className="nxc-tool nxc-tool-code" title="Code">&lt;/&gt;</button>
                <button type="button" className="nxc-tool" title="Document">📋</button>
                <button type="button" className="nxc-tool" title="Image">🖼️</button>
                <button type="button" className="nxc-tool nxc-tool-plus" title="More">+</button>
              </div>
              <div className="nxc-bar-right">
                <button
                  type="button"
                  className="nxc-model-sel"
                  onClick={() => activeModel && setSelectedModel(activeModel)}
                  title="View model details"
                >
                  {activeModel?.name || 'Select model'} ▾
                </button>
                <button
                  type="button"
                  className="nxc-send-btn"
                  onClick={() => sendMessage()}
                  title="Send"
                >
                  ➤
                </button>
              </div>
            </div>

            {/* Category tabs */}
            <div className="nxc-tabs-row">
              {CATEGORY_TABS.map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  className={`nxc-tab${activeTab === tab.key ? ' nxc-tab-on' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.key === 'use_cases' && (
                    <span className="nxc-tab-sq">◼</span>
                  )}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Suggested prompts */}
            <div className="nxc-prompts-grid">
              {currentPrompts.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  className="nxc-prompt-item"
                  onClick={() => {
                    setChatInput(prompt);
                    textareaRef.current?.focus();
                  }}
                >
                  • {prompt}
                </button>
              ))}
            </div>
          </div>
        </main>

        {/* ── RIGHT PANEL ──────────────────────────── */}
        <aside className="nxc-rpanel">
          <div className="nxc-rp-hd">QUICK ACTIONS</div>
          {QUICK_ACTIONS.map(({ section, items }) => (
            <div key={section} className="nxc-rp-sec">
              <div className="nxc-rp-sec-lbl">{section}</div>
              {items.map(item => (
                <button
                  key={item.label}
                  type="button"
                  className="nxc-rp-item"
                  onClick={() => sendMessage(item.label)}
                >
                  <span className="nxc-rp-ico" style={{ background: item.bg }}>
                    {item.icon}
                  </span>
                  <span className="nxc-rp-lbl">{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </aside>

      </div>

      {selectedModel && (
        <ModelModal model={selectedModel} onClose={() => setSelectedModel(null)} />
      )}
    </div>
  );
}
