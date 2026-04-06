'use client';

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLocale } from '../../context/LocaleContext';
import { useAuth } from '../../hooks/useAuth';
import { useAgentWorkspace } from '../../hooks/useAgentWorkspace';
import AgentTemplateModal from '../../components/AgentTemplateModal';
import WorkbenchSearch from '../../components/WorkbenchSearch';
import { fetchSystemAgentsPage } from '../../services/agentService';

/* ────────────────────────────────────────────────────────────
   Task Workspace — shown when a task is selected
   Matches the reference: icon, "What can I help you with?",
   category chips, 2-col suggestion grid, full-width chat input
   ──────────────────────────────────────────────────────────── */

const TASK_CATEGORIES = [
  { id: 'quick', label: 'Quick start', icon: '✦' },
  { id: 'code', label: 'Code', icon: '<>' },
  { id: 'content', label: 'Content', icon: '✏️' },
  { id: 'research', label: 'Research', icon: '🔍' },
  { id: 'business', label: 'Business', icon: '🗂' },
];

const TASK_SUGGESTIONS = {
  quick: [
    { icon: '🚀', text: 'Build a dashboard for my team' },
    { icon: '📊', text: 'Analyze my spreadsheet data' },
    { icon: '📝', text: 'Write a business proposal' },
    { icon: '📋', text: 'Plan my product launch strategy' },
  ],
  code: [
    { icon: '🐛', text: 'Debug this function' },
    { icon: '🔨', text: 'Refactor my codebase' },
    { icon: '✅', text: 'Write unit tests' },
    { icon: '📖', text: 'Document this API' },
  ],
  content: [
    { icon: '✍️', text: 'Write a blog post about AI' },
    { icon: '📧', text: 'Draft a marketing email' },
    { icon: '📱', text: 'Create social media captions' },
    { icon: '🎙️', text: 'Write a podcast script' },
  ],
  research: [
    { icon: '🔎', text: 'Research market trends' },
    { icon: '📑', text: 'Summarise these documents' },
    { icon: '🌐', text: 'Find competitor insights' },
    { icon: '📈', text: 'Analyse industry data' },
  ],
  business: [
    { icon: '💼', text: 'Create a business plan' },
    { icon: '📉', text: 'Build financial projections' },
    { icon: '🤝', text: 'Draft a partnership proposal' },
    { icon: '🎯', text: 'Define customer personas' },
  ],
};

const TOOLBAR_ICONS = ['🎤', '⚡', '📎', '🖼️', '+'];

function TaskWorkspace({ task, onBack }) {
  const [activeCat, setActiveCat] = useState('quick');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendMessage = (text) => {
    const msg = (text || chatInput).trim();
    if (!msg) return;
    setStarted(true);
    setChatMessages((prev) => [
      ...prev,
      { id: Date.now(), role: 'user', text: msg },
      {
        id: Date.now() + 1,
        role: 'agent',
        text: `Working on: "${msg}" — connect a real model for live responses.`,
      },
    ]);
    setChatInput('');
  };

  const suggestions = TASK_SUGGESTIONS[activeCat] || TASK_SUGGESTIONS.quick;

  return (
    <div className="tw-root">
      {/* ── Top bar ── */}
      <div className="tw-topbar">
        <button type="button" className="tw-back-btn" onClick={onBack} aria-label="Back">
          ‹
        </button>
        <div className="tw-topbar-info">
          <span className="tw-topbar-title">{task.title}</span>
          <span className="tw-topbar-meta">● {chatMessages.filter((m) => m.role === 'user').length} messages</span>
        </div>
        <div className="tw-topbar-actions">
          <button type="button" className="tw-icon-btn" aria-label="Search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
          <button type="button" className="tw-icon-btn" aria-label="More">
            ···
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="tw-body">
        {!started ? (
          /* Prompt screen */
          <div className="tw-prompt-screen">
            <div className="tw-prompt-avatar">🤖</div>
            <h2 className="tw-prompt-heading">
              What can I help you <span className="tw-prompt-accent">with?</span>
            </h2>
            <p className="tw-prompt-sub">
              Your AI agent is ready to help you accomplish any task — just<br />
              type below or pick a suggestion.
            </p>

            {/* Category chips */}
            <div className="tw-cat-chips">
              {TASK_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`tw-cat-chip${activeCat === cat.id ? ' tw-cat-chip--active' : ''}`}
                  onClick={() => setActiveCat(cat.id)}
                >
                  <span className="tw-cat-chip-icon">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>

            {/* 2-col suggestion grid */}
            <div className="tw-suggestions-grid">
              {suggestions.map((s) => (
                <button
                  key={s.text}
                  type="button"
                  className="tw-suggestion-card"
                  onClick={() => sendMessage(s.text)}
                >
                  <span className="tw-suggestion-icon">{s.icon}</span>
                  <span className="tw-suggestion-text">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat messages */
          <div className="tw-messages">
            {chatMessages.map((m) => (
              <div key={m.id} className={`tw-bubble tw-bubble--${m.role}`}>
                {m.role === 'agent' && <div className="tw-bubble-avatar">🤖</div>}
                <div className="tw-bubble-text">{m.text}</div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Input bar ── */}
      <div className="tw-input-bar">
        <div className="tw-input-wrap">
          <textarea
            className="tw-input-textarea"
            rows={1}
            placeholder="Type your message..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <div className="tw-input-footer">
            <div className="tw-input-tools">
              {TOOLBAR_ICONS.map((ic, i) => (
                <button key={i} type="button" className="tw-tool-btn" aria-label={ic}>
                  {ic}
                </button>
              ))}
            </div>
            <span className="tw-input-agent-label">Agent</span>
          </div>
        </div>
        <button
          type="button"
          className="tw-send-btn"
          onClick={() => sendMessage()}
          aria-label="Send"
        >
          ➤
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Workbench (default) — shown when no task is selected
   ──────────────────────────────────────────────────────────── */
const WB_CATEGORIES = [
  { id: 'use_cases', label: 'Use cases', icon: '📋' },
  { id: 'build_business', label: 'Build a business', icon: '💼' },
  { id: 'help_learn', label: 'Help me learn', icon: '📚' },
  { id: 'monitor', label: 'Monitor the situation', icon: '👁️' },
  { id: 'research', label: 'Research', icon: '🔍' },
  { id: 'create_content', label: 'Create content', icon: '✍️' },
  { id: 'analyze_research', label: 'Analyze & research', icon: '📊' },
];

const WB_SUGGESTIONS = {
  use_cases: [
    { icon: '🚀', text: 'Build a space exploration timeline app' },
    { icon: '📊', text: 'Create a real-time stock market tracker' },
    { icon: '🤖', text: 'Prototype an AI chatbot demo application' },
    { icon: '📋', text: 'Create a project management Kanban board' },
  ],
  build_business: [
    { icon: '📈', text: 'Build a revenue tracking dashboard for my business' },
    { icon: '💡', text: 'Help me build a startup pitch deck from scratch' },
    { icon: '💰', text: 'Build a financial model with 3-year projections' },
    { icon: '🎯', text: 'Define customer personas and targeting strategy' },
  ],
  help_learn: [
    { icon: '📖', text: 'Explain machine learning in simple terms' },
    { icon: '🧠', text: 'Create a study plan for learning Python' },
    { icon: '🎓', text: 'Help me understand neural networks' },
    { icon: '✏️', text: 'Summarise this research paper' },
  ],
  monitor: [
    { icon: '📡', text: 'Set up alerts for keyword mentions' },
    { icon: '🌐', text: 'Track competitor pricing changes' },
    { icon: '📰', text: 'Monitor industry news daily' },
    { icon: '📉', text: 'Watch for market anomalies' },
  ],
  research: [
    { icon: '🔎', text: 'Research the top 10 AI tools in 2025' },
    { icon: '📑', text: 'Find academic sources on climate change' },
    { icon: '🌍', text: 'Compare education systems globally' },
    { icon: '🧬', text: 'Summarise latest biotech breakthroughs' },
  ],
  create_content: [
    { icon: '✍️', text: 'Write a blog post about productivity hacks' },
    { icon: '🎙️', text: 'Draft a YouTube video script' },
    { icon: '📧', text: 'Create an email newsletter template' },
    { icon: '📱', text: 'Generate Instagram caption ideas' },
  ],
  analyze_research: [
    { icon: '📊', text: 'Analyse survey data and visualise results' },
    { icon: '📁', text: 'Find patterns in my CSV dataset' },
    { icon: '📈', text: 'Create a competitive analysis report' },
    { icon: '🔢', text: 'Interpret these financial statements' },
  ],
};

/** Local quick picks (task-style) — complements API suggestions in WorkbenchSearch */
function QuickTaskIdeas({ onPick, title }) {
  const [activeCat, setActiveCat] = useState('use_cases');
  const list = WB_SUGGESTIONS[activeCat] || WB_SUGGESTIONS.use_cases;
  return (
    <section className="ab-quick-tasks" aria-label={title}>
      <div className="ab-quick-tasks-hd">{title}</div>
      <div className="wb-chips" role="tablist" style={{ marginBottom: 12 }}>
        {WB_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={activeCat === cat.id}
            className={`wb-chip${activeCat === cat.id ? ' wb-chip--active' : ''}`}
            onClick={() => setActiveCat(cat.id)}
          >
            <span className="wb-chip-ico">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>
      <div className="ab-quick-grid">
        {list.map((s) => (
          <button
            key={s.text}
            type="button"
            className="ab-quick-card"
            onClick={() => onPick(s.text)}
          >
            <span className="ab-quick-card-ico">{s.icon}</span>
            <span className="ab-quick-card-text">{s.text}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function Workbench({
  onSubmit,
  tplRows,
  tplLoading,
  onOpenTemplate,
  onOpenScratch,
  initialQuery,
  quickTaskTitle,
}) {
  return (
    <div className="ab-workbench-view">
      <WorkbenchSearch
        variant="agents"
        showHeadline
        initialQuery={initialQuery || ''}
        tableLayout
        onSubmit={onSubmit}
      />
      <QuickTaskIdeas onPick={onSubmit} title={quickTaskTitle} />

      {/* Agent Templates */}
      <div className="ab-tpl-section">
        <div className="ab-tpl-section-hd">
          <span className="ab-tpl-label">AGENT TEMPLATES</span>
          {!tplLoading && <span className="ab-tpl-count">{tplRows.length}</span>}
        </div>
        {tplLoading ? (
          <div className="ab-tpl-loading-text">Loading templates…</div>
        ) : (
          <div className="agents-template-row">
            {tplRows.map((agent) => (
              <button
                key={agent.templateId || agent._id}
                type="button"
                className="agents-tpl-card"
                onClick={() => onOpenTemplate(agent)}
              >
                <div className="agents-tpl-top">
                  <span className="agents-tpl-ico">{agent.icon}</span>
                  <span className="agents-tpl-name">{agent.title}</span>
                </div>
                <p className="agents-tpl-desc">{agent.description}</p>
                <div className="agents-tpl-tags">
                  <span className="agents-tpl-model">{agent.model}</span>
                  {(agent.tags || []).slice(0, 2).map((tag) => (
                    <span key={tag} className="agents-tpl-tag">{tag}</span>
                  ))}
                </div>
              </button>
            ))}
            <button
              type="button"
              className="agents-tpl-card agents-tpl-card--scratch"
              onClick={onOpenScratch}
            >
              <span className="agents-scratch-ico">+</span>
              <div className="agents-scratch-txt">Build from Scratch</div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Main page
   ──────────────────────────────────────────────────────────── */
function AgentsPageInner() {
  const { messages, t } = useLocale();
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const {
    userAgents: workspaceAgents,
    tasks,
    addAgent,
    addTask,
    patchTask,
    removeTask,
  } = useAgentWorkspace();

  /* modal */
  const [modal, setModal] = useState({ open: false, mode: 'template', agent: null });
  /** Sidebar: default templates vs user's custom agents (Netlify-style switcher) */
  const [libraryTab, setLibraryTab] = useState('default');

  /* task selection — drives main view */
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [taskDraft, setTaskDraft] = useState('');
  const [showTaskInput, setShowTaskInput] = useState(false);
  const [taskBusy, setTaskBusy] = useState(false);
  const taskInputRef = useRef(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editDraft, setEditDraft] = useState('');
  const editInputRef = useRef(null);

  /* templates for workbench */
  const [tplRows, setTplRows] = useState([]);
  const [tplLoading, setTplLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setTplLoading(true);
      try {
        const d = await fetchSystemAgentsPage({ page: 1, pageSize: 50, q: '' });
        if (!cancelled) setTplRows(d.agents || []);
      } catch {
        if (!cancelled) setTplRows([]);
      } finally {
        if (!cancelled) setTplLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* default agent for task creation */
  const defaultAgent = useMemo(
    () => workspaceAgents.find((a) => a.isDefault) || workspaceAgents[0] || null,
    [workspaceAgents]
  );

  /* auto-select first task after create */
  const prevTaskCount = useRef(tasks.length);
  useEffect(() => {
    if (tasks.length > prevTaskCount.current) {
      const newest = tasks[tasks.length - 1];
      if (newest?._id) setSelectedTaskId(newest._id);
    }
    prevTaskCount.current = tasks.length;
  }, [tasks]);

  useEffect(() => {
    if (editingTaskId) editInputRef.current?.focus();
  }, [editingTaskId]);

  const handleNewTask = async () => {
    const title = taskDraft.trim();
    if (!title || !defaultAgent) return;
    setTaskBusy(true);
    try {
      await addTask(defaultAgent._id, title);
      setTaskDraft('');
      setShowTaskInput(false);
    } finally {
      setTaskBusy(false);
    }
  };

  const cancelNewTask = () => {
    setTaskDraft('');
    setShowTaskInput(false);
  };

  const openNewTaskInput = () => {
    setEditingTaskId(null);
    setEditDraft('');
    setShowTaskInput(true);
    setTimeout(() => taskInputRef.current?.focus(), 30);
  };

  const toggleTask = async (task) => {
    await patchTask(task._id, { done: !task.done });
  };

  const startEditTask = (task) => {
    setShowTaskInput(false);
    setTaskDraft('');
    setEditingTaskId(task._id);
    setEditDraft(task.title);
  };

  const cancelEditTask = () => {
    setEditingTaskId(null);
    setEditDraft('');
  };

  const saveEditTask = async () => {
    const title = editDraft.trim();
    if (!title || !editingTaskId) return;
    setTaskBusy(true);
    try {
      await patchTask(editingTaskId, { title });
      cancelEditTask();
    } finally {
      setTaskBusy(false);
    }
  };

  const duplicateTask = async (task) => {
    if (!task.agent) return;
    setTaskBusy(true);
    try {
      await addTask(task.agent, `${task.title}${t('agents.taskDuplicateSuffix')}`);
    } finally {
      setTaskBusy(false);
    }
  };

  const deleteTask = async (task) => {
    setTaskBusy(true);
    try {
      await removeTask(task._id);
      if (selectedTaskId === task._id) setSelectedTaskId(null);
      if (editingTaskId === task._id) cancelEditTask();
    } finally {
      setTaskBusy(false);
    }
  };

  const displayFor = (agent) => {
    const block = messages.agents?.templates?.[agent.templateId];
    return {
      title: block?.title || agent.title || agent.name || '',
      description: block?.description || agent.description || '',
      tags: block?.tags || agent.tags || [],
    };
  };

  const openTemplateModal = (agent) => {
    setModal({ open: true, mode: 'template', agent });
  };

  const openScratchModal = () => {
    setModal({
      open: true,
      mode: 'scratch',
      agent: { templateId: '', title: 'Custom Agent', description: '', model: 'GPT-4o', tags: [], icon: '➕' },
    });
  };

  const handleSaveAgent = async (payload) => {
    await addAgent(payload);
  };

  const handleWorkbenchSubmit = useCallback((text) => {
    /* create a task from a workbench suggestion */
    setTaskDraft(text.slice(0, 200));
    setShowTaskInput(true);
    setTimeout(() => taskInputRef.current?.focus(), 30);
  }, []);

  const selectedTask = tasks.find((task) => task._id === selectedTaskId) || null;
  const modalDisplay = modal.agent ? displayFor(modal.agent) : { title: '', description: '', tags: [] };

  if (authLoading) {
    return (
      <div className="ab-root">
        <div className="ab-main ab-main--center">
          <div className="ab-spinner" aria-hidden />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="ab-root">
        <div className="ab-main ab-main--center ab-gate">
          <div className="ab-gate-card">
            <span className="ab-gate-ico" aria-hidden>
              🔐
            </span>
            <h2 className="ab-gate-title">{t('agents.gateTitle')}</h2>
            <p className="ab-gate-text">{t('agents.gateText')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ab-root">
      {/* ═══════════════ LEFT SIDEBAR ═══════════════ */}
      <aside className="ab-sidebar">
        {/* Agent Builder block */}
        <div className="ab-sb-builder">
          <div className="ab-sb-builder-hd">
            <div className="ab-sb-builder-avatar">🤖</div>
            <div>
              <div className="ab-sb-builder-title">Agent Builder</div>
              <div className="ab-sb-builder-desc">
                Create powerful AI agents using any model. Pick a template or start from scratch.
              </div>
            </div>
          </div>
          <button type="button" className="ab-new-agent-btn" onClick={openScratchModal}>
            ✦ + New Agent
          </button>
        </div>

        <div className="ab-sb-library">
          <div className="ab-sb-library-label">{t('agents.libraryTemplates')}</div>
          <div className="ab-sb-segment" role="tablist" aria-label={t('agents.libraryTemplates')}>
            <button
              type="button"
              role="tab"
              aria-selected={libraryTab === 'default'}
              className={libraryTab === 'default' ? 'ab-sb-segment--active' : ''}
              onClick={() => setLibraryTab('default')}
            >
              {t('agents.libraryDefault')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={libraryTab === 'mine'}
              className={libraryTab === 'mine' ? 'ab-sb-segment--active' : ''}
              onClick={() => setLibraryTab('mine')}
            >
              {t('agents.libraryMine')}
            </button>
          </div>
          <div className="ab-sb-lib-list">
            {libraryTab === 'default' && (
              <>
                {tplLoading && (
                  <p className="ab-sb-empty">{t('agents.loading')}</p>
                )}
                {!tplLoading && tplRows.length === 0 && (
                  <p className="ab-sb-empty">{t('agents.noTemplates')}</p>
                )}
                {!tplLoading &&
                  tplRows.map((agent) => (
                    <button
                      key={agent.templateId || agent._id}
                      type="button"
                      className="ab-sb-lib-item"
                      onClick={() => openTemplateModal(agent)}
                    >
                      <span className="ab-sb-lib-ico">{agent.icon || '🤖'}</span>
                      <span className="ab-sb-lib-name">{agent.title}</span>
                    </button>
                  ))}
              </>
            )}
            {libraryTab === 'mine' && (
              <>
                {workspaceAgents.length === 0 ? (
                  <p className="ab-sb-empty">{t('agents.libraryEmptyMine')}</p>
                ) : (
                  workspaceAgents.map((a) => (
                    <div key={a._id} className="ab-sb-lib-item" style={{ cursor: 'default' }}>
                      <span className="ab-sb-lib-ico">{a.icon || '✦'}</span>
                      <span className="ab-sb-lib-name">{a.title || a.name || 'Agent'}</span>
                      {a.isDefault ? <span className="ab-sb-badge">Default</span> : null}
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>

        {/* Help card */}
        <div className="ab-sb-help-card">
          <div className="ab-sb-help-icon">✦</div>
          <div className="ab-sb-help-title">Not sure where to start?</div>
          <p className="ab-sb-help-text">
            Chat with our AI guide — describe what you want your agent to do and get a personalised setup plan.
          </p>
          <Link href="/chat-hub" className="ab-sb-help-link">
            Ask the Hub →
          </Link>
        </div>

        {/* Tasks section — Netlify-style: header, composer (Add/Cancel), cards with Edit/Duplicate/Delete */}
        <div className="ab-sb-tasks">
          <div className="ab-sb-tasks-head">
            <span className="ab-sb-tasks-label">{t('agents.tasksSection')}</span>
            <span className="ab-sb-tasks-count" aria-hidden>
              {tasks.length}
            </span>
          </div>

          <button type="button" className="ab-sb-new-task" onClick={openNewTaskInput}>
            <span className="ab-sb-new-task-plus">+</span>
            {t('agents.taskNew')}
          </button>

          {showTaskInput ? (
            <div className="ab-sb-task-composer">
              <input
                ref={taskInputRef}
                className="ab-sb-task-composer-input"
                value={taskDraft}
                onChange={(e) => setTaskDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNewTask();
                  if (e.key === 'Escape') cancelNewTask();
                }}
                placeholder={t('agents.taskPlaceholder')}
                maxLength={200}
                disabled={taskBusy || !defaultAgent}
                aria-label={t('agents.taskPlaceholder')}
              />
              <div className="ab-sb-task-composer-actions">
                <button
                  type="button"
                  className="ab-sb-task-composer-btn ab-sb-task-composer-btn--primary"
                  onClick={handleNewTask}
                  disabled={taskBusy || !taskDraft.trim() || !defaultAgent}
                >
                  {t('agents.taskAdd')}
                </button>
                <button type="button" className="ab-sb-task-composer-btn" onClick={cancelNewTask}>
                  {t('agents.taskCancel')}
                </button>
              </div>
            </div>
          ) : null}

          <ul className="ab-sb-task-list">
            {tasks.length === 0 && !showTaskInput ? (
              <li className="ab-sb-task-empty" role="status">
                {t('agents.tasksEmpty')}
              </li>
            ) : null}

            {tasks.map((task) => {
              const isActive = selectedTaskId === task._id;
              const isEditing = editingTaskId === task._id;
              return (
                <li
                  key={task._id}
                  className={`ab-sb-task-card${isActive ? ' ab-sb-task-card--active' : ''}`}
                >
                  <div className="ab-sb-task-row-top">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleTask(task)}
                      className="ab-sb-task-check"
                      aria-label={task.title}
                    />
                    <div
                      role={isEditing ? undefined : 'button'}
                      tabIndex={isEditing ? -1 : 0}
                      className="ab-sb-task-title-hit"
                      onClick={() => !isEditing && setSelectedTaskId(isActive ? null : task._id)}
                      onKeyDown={(e) => {
                        if (isEditing) return;
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedTaskId(isActive ? null : task._id);
                        }
                      }}
                    >
                      {isEditing ? (
                        <input
                          ref={editInputRef}
                          className="ab-sb-task-edit-input"
                          value={editDraft}
                          onChange={(e) => setEditDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEditTask();
                            if (e.key === 'Escape') cancelEditTask();
                          }}
                          maxLength={200}
                          disabled={taskBusy}
                          aria-label={t('agents.taskEdit')}
                        />
                      ) : (
                        <span
                          className={[
                            'ab-sb-task-text',
                            task.done ? 'ab-sb-task-text--done' : '',
                            isActive ? 'ab-sb-task-text--active' : '',
                          ].filter(Boolean).join(' ')}
                        >
                          {task.title}
                        </span>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="ab-sb-task-actions ab-sb-task-actions--edit">
                      <button
                        type="button"
                        className="ab-sb-task-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          saveEditTask();
                        }}
                        disabled={taskBusy || !editDraft.trim()}
                      >
                        {t('agents.taskSave')}
                      </button>
                      <button
                        type="button"
                        className="ab-sb-task-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelEditTask();
                        }}
                      >
                        {t('agents.taskCancel')}
                      </button>
                    </div>
                  ) : (
                    <div className="ab-sb-task-actions">
                      <button
                        type="button"
                        className="ab-sb-task-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditTask(task);
                        }}
                        disabled={taskBusy}
                      >
                        {t('agents.taskEdit')}
                      </button>
                      <button
                        type="button"
                        className="ab-sb-task-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateTask(task);
                        }}
                        disabled={taskBusy}
                      >
                        {t('agents.taskDuplicate')}
                      </button>
                      <button
                        type="button"
                        className="ab-sb-task-action ab-sb-task-action--danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTask(task);
                        }}
                        disabled={taskBusy}
                      >
                        {t('agents.taskDelete')}
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* ═══════════════ MAIN CONTENT ═══════════════ */}
      <div className="ab-main">
        {selectedTask ? (
          <TaskWorkspace
            task={selectedTask}
            onBack={() => setSelectedTaskId(null)}
          />
        ) : (
          <Workbench
            onSubmit={handleWorkbenchSubmit}
            tplRows={tplRows}
            tplLoading={tplLoading}
            onOpenTemplate={openTemplateModal}
            onOpenScratch={openScratchModal}
            initialQuery={initialQ}
            quickTaskTitle={t('agents.quickTaskTitle')}
          />
        )}
      </div>

      <AgentTemplateModal
        open={modal.open}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
        mode={modal.mode}
        systemAgent={modal.agent}
        display={modalDisplay}
        onSave={handleSaveAgent}
      />
    </div>
  );
}

export default function AgentsPage() {
  return (
    <Suspense
      fallback={
        <div className="ab-root">
          <div className="ab-main ab-main--center">
            <div className="ab-spinner" />
          </div>
        </div>
      }
    >
      <AgentsPageInner />
    </Suspense>
  );
}
