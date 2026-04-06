'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import ModelModal from '../../components/ModelModal';
import { useLocale } from '../../context/LocaleContext';
import { CHAT_HUB_ACTION_PROMPTS, CHAT_HUB_TAB_PROMPTS } from '../../i18n/chatHubPrompts';
import { useChatHubPersistence } from '../../hooks/useChatHubPersistence';
import { useModels } from '../../hooks/useModels';
import { useRecommendation } from '../../hooks/useRecommendation';

const ACTION_CARD_DEFS = [
  { key: 'write', icon: '✏️', prompt: 'Write long-form content, emails, and social posts in my tone.' },
  { key: 'images', icon: '🎨', prompt: 'Create high quality images and artwork for my brand and product visuals.' },
  { key: 'build', icon: '🔨', prompt: 'Help me build an app, tool, or website from scratch using AI.' },
  { key: 'automate', icon: '⚡', prompt: 'Help me automate repetitive tasks and workflows to save time.' },
  { key: 'analyse', icon: '📊', prompt: 'Analyse a dataset and surface insights, trends, and anomalies.' },
  { key: 'explore', icon: '🔭', prompt: 'I am just exploring what AI models can do for me.' },
];

const CATEGORY_TAB_KEYS = [
  'use_cases',
  'monitor',
  'prototype',
  'business',
  'content',
  'research',
  'learn',
];

const QUICK_ACTIONS_DEF = [
  {
    sectionKey: 'navTools',
    items: [
      { icon: '🛍', actionKey: 'browseMarketplace', bg: '#fef3c7' },
      { icon: '🤖', actionKey: 'buildAgent', bg: '#ede9fe' },
      { icon: '📖', actionKey: 'howToGuide', bg: '#dbeafe' },
      { icon: '✨', actionKey: 'promptEngineering', bg: '#fff7ed' },
      { icon: '💰', actionKey: 'viewPricing', bg: '#fef9c3' },
      { icon: '📊', actionKey: 'modelsAnalysis', bg: '#dcfce7' },
    ],
  },
  {
    sectionKey: 'createGenerate',
    items: [
      { icon: '🎨', actionKey: 'createImage', bg: '#fff7ed' },
      { icon: '🎵', actionKey: 'generateAudio', bg: '#fce7f3' },
      { icon: '🎬', actionKey: 'createVideo', bg: '#ede9fe' },
      { icon: '📑', actionKey: 'createSlides', bg: '#dcfce7' },
      { icon: '📈', actionKey: 'createInfographs', bg: '#fef3c7' },
      { icon: '❓', actionKey: 'createQuiz', bg: '#fee2e2' },
      { icon: '🗂️', actionKey: 'createFlashcards', bg: '#fff7ed' },
      { icon: '🧠', actionKey: 'createMindMap', bg: '#ede9fe' },
    ],
  },
  {
    sectionKey: 'analyzeWrite',
    items: [
      { icon: '📉', actionKey: 'analyzeData', bg: '#dcfce7' },
      { icon: '✍️', actionKey: 'writeContent', bg: '#fff7ed' },
      { icon: '💻', actionKey: 'codeGeneration', bg: '#dbeafe' },
      { icon: '📄', actionKey: 'documentAnalysis', bg: '#ede9fe' },
      { icon: '🌐', actionKey: 'translate', bg: '#dbeafe' },
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

export default function ChatHubPage() {
  const { models, loading: modelsLoading } = useModels();
  const { recommend } = useRecommendation();
  const { t, messages } = useLocale();

  const [selectedModel, setSelectedModel] = useState(null);
  const [activeModelIndex, setActiveModelIndex] = useState(0);
  const [modelSearch, setModelSearch] = useState('');
  const { chatMessages, setChatMessages, clearChat } = useChatHubPersistence();
  const [chatInput, setChatInput] = useState('');
  const [activeTab, setActiveTab] = useState('use_cases');
  const [isTyping, setIsTyping] = useState(false);

  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  const activeModel = models[activeModelIndex] || null;

  const tabSend = CHAT_HUB_TAB_PROMPTS[activeTab] || CHAT_HUB_TAB_PROMPTS.use_cases;
  const tabDisplay = messages.chatHub?.tabPrompts?.[activeTab] || tabSend;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [chatInput]);

  const filteredModels = models.filter(m =>
    !modelSearch ||
    m.name?.toLowerCase().includes(modelSearch.toLowerCase()) ||
    m.provider?.toLowerCase().includes(modelSearch.toLowerCase())
  );

  const sendMessage = useCallback((text) => {
    const trimmed = (text ?? chatInput).trim();
    if (!trimmed) return;

    setChatMessages((prev) => [...prev, { id: Date.now(), role: 'user', text: trimmed }]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      let botText;
      if (models && models.length > 0) {
        const results = recommend(trimmed, models);
        const names = results.slice(0, 3).map((r) => r.model?.name).filter(Boolean);
        botText = names.length
          ? t('chatHub.bot.matches', {
              count: results.length,
              names: names.join(', '),
              top: names[0],
              score: results[0].matchPercentage,
            })
          : t('chatHub.bot.noMatches');
      } else {
        botText = t('chatHub.bot.noModelsLoaded');
      }
      setIsTyping(false);
      setChatMessages((prev) => [...prev, { id: Date.now(), role: 'bot', text: botText }]);
    }, 700);
  }, [chatInput, models, recommend, t]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const promptRows = useMemo(() => {
    return tabSend.map((sendPrompt, i) => ({
      send: sendPrompt,
      display: tabDisplay[i] || sendPrompt,
    }));
  }, [tabSend, tabDisplay]);

  return (
    <div className="nxc-page">
      <div className="nxc-shell">

        <aside className="nxc-sidebar">
          <div className="nxc-sb-hd">{t('chatHub.modelsSidebar')}</div>

          <div className="nxc-sb-search-wrap">
            <div className="nxc-sb-search-box">
              <span className="nxc-sb-search-ico">🔍</span>
              <input
                className="nxc-sb-search"
                placeholder={t('chatHub.searchPlaceholder')}
                value={modelSearch}
                onChange={(e) => setModelSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="nxc-model-list">
            {modelsLoading ? (
              <p className="nxc-sb-empty">{t('chatHub.loadingModels')}</p>
            ) : filteredModels.length === 0 ? (
              <p className="nxc-sb-empty">{t('chatHub.noModels')}</p>
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

        <main className="nxc-main">

          <div className="nxc-chat-area">
            {chatMessages.length === 0 && !isTyping ? (

              <div className="nxc-welcome-wrap">
                <div className="nxc-welcome-card">
                  <div className="nxc-welcome-av">✦</div>

                  <h2 className="nxc-welcome-ttl">
                    {t('chatHub.welcomeTitle')}
                  </h2>
                  <p className="nxc-welcome-sub">
                    {t('chatHub.welcomeSubBefore')}
                    <strong>{t('chatHub.welcomeSubStrong')}</strong>
                    {t('chatHub.welcomeSubAfter')}
                  </p>

                  <div className="nxc-action-box">
                    <div className="nxc-action-lbl">
                      <span className="nxc-action-star">✦</span>
                      {' '}
                      {t('chatHub.actionLabel')}
                    </div>
                    <div className="nxc-action-grid">
                      {ACTION_CARD_DEFS.map((card) => (
                        <button
                          key={card.key}
                          type="button"
                          className="nxc-action-card"
                          onClick={() => sendMessage(card.prompt)}
                        >
                          <span className="nxc-ac-ico">{card.icon}</span>
                          <span className="nxc-ac-lbl">{t(`chatHub.actionCards.${card.key}.label`)}</span>
                          <span className="nxc-ac-desc">{t(`chatHub.actionCards.${card.key}.desc`)}</span>
                        </button>
                      ))}
                    </div>
                    <p className="nxc-action-hint">
                      {t('chatHub.actionHint')}
                    </p>
                  </div>
                </div>
              </div>

            ) : (

              <div className="nxc-messages">
                <div className="nxc-chat-toolbar">
                  <button type="button" className="nxc-clear-chat-btn" onClick={clearChat}>
                    {t('chatHub.clearChat')}
                  </button>
                </div>
                {chatMessages.map((m) => (
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

          <div className="nxc-input-area">

            <div className="nxc-inp-wrap">
              <textarea
                ref={textareaRef}
                className="nxc-inp-ta"
                placeholder={t('chatHub.inputPlaceholder')}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
            </div>

            <div className="nxc-inp-bar">
              <div className="nxc-tools">
                <button type="button" className="nxc-tool" title={t('chatHub.toolVoice')}>🎙️</button>
                <button type="button" className="nxc-tool" title={t('chatHub.toolAttach')}>📎</button>
                <button type="button" className="nxc-tool" title={t('chatHub.toolVideo')}>🎥</button>
                <button type="button" className="nxc-tool nxc-tool-code" title={t('chatHub.toolCode')}>&lt;/&gt;</button>
                <button type="button" className="nxc-tool" title={t('chatHub.toolDocument')}>📋</button>
                <button type="button" className="nxc-tool" title={t('chatHub.toolImage')}>🖼️</button>
                <button type="button" className="nxc-tool nxc-tool-plus" title={t('chatHub.toolMore')}>+</button>
              </div>
              <div className="nxc-bar-right">
                <button
                  type="button"
                  className="nxc-model-sel"
                  onClick={() => activeModel && setSelectedModel(activeModel)}
                  title={t('chatHub.viewModelDetails')}
                >
                  {activeModel?.name || t('chatHub.selectModel')} ▾
                </button>
                <button
                  type="button"
                  className="nxc-send-btn"
                  onClick={() => sendMessage()}
                  title={t('chatHub.sendTitle')}
                >
                  ➤
                </button>
              </div>
            </div>

            <div className="nxc-tabs-row">
              {CATEGORY_TAB_KEYS.map((tabKey) => (
                <button
                  key={tabKey}
                  type="button"
                  className={`nxc-tab${activeTab === tabKey ? ' nxc-tab-on' : ''}`}
                  onClick={() => setActiveTab(tabKey)}
                >
                  {tabKey === 'use_cases' && (
                    <span className="nxc-tab-sq">◼</span>
                  )}
                  {t(`chatHub.tabs.${tabKey}`)}
                </button>
              ))}
            </div>

            <div className="nxc-prompts-grid">
              {promptRows.map((row, i) => (
                <button
                  key={i}
                  type="button"
                  className="nxc-prompt-item"
                  onClick={() => {
                    sendMessage(row.send);
                    textareaRef.current?.focus();
                  }}
                >
                  • {row.display}
                </button>
              ))}
            </div>
          </div>
        </main>

        <aside className="nxc-rpanel">
          <div className="nxc-rp-hd">{t('chatHub.quickActions')}</div>
          {QUICK_ACTIONS_DEF.map(({ sectionKey, items }) => (
            <div key={sectionKey} className="nxc-rp-sec">
              <div className="nxc-rp-sec-lbl">{t(`chatHub.sections.${sectionKey}`)}</div>
              {items.map((item) => {
                const sendText = CHAT_HUB_ACTION_PROMPTS[item.actionKey];
                return (
                  <button
                    key={item.actionKey}
                    type="button"
                    className="nxc-rp-item"
                    onClick={() => sendMessage(sendText)}
                  >
                    <span className="nxc-rp-ico" style={{ background: item.bg }}>
                      {item.icon}
                    </span>
                    <span className="nxc-rp-lbl">{t(`chatHub.quickItems.${item.actionKey}`)}</span>
                  </button>
                );
              })}
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
