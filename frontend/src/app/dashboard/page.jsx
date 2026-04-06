'use client';

import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../context/LocaleContext';
import { useAgentWorkspace } from '../../hooks/useAgentWorkspace';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { t } = useLocale();
  const { userAgents, tasks, loading: agentsLoading } = useAgentWorkspace();

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="auth-spinner" />
      </div>
    );
  }

  if (!user) {
    return <main className="auth-gate-placeholder" aria-hidden="true" />;
  }

  const completedTasks = tasks.filter((tk) => tk.done).length;
  const activeTasks = tasks.filter((tk) => !tk.done).length;

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  return (
    <main>
      <div className="app-wrapper">

        {/* ── Hero Header ── */}
        <div className="db2-hero">
          <div className="db2-hero-left">
            <div className="db2-avatar">
              {user.name.charAt(0).toUpperCase()}
              <span className="db2-avatar-online" />
            </div>
            <div className="db2-hero-meta">
              <h1 className="db2-hero-name">{user.name}</h1>
              <p className="db2-hero-email">{user.email}</p>
              {joinDate && <p className="db2-hero-joined">Member since {joinDate}</p>}
            </div>
          </div>
          <div className="db2-hero-actions">
            <span className="db2-role-chip">
              {user.role === 'admin' ? t('dashboard.admin') : t('dashboard.user')}
            </span>
            <Link href="/agents" className="db2-btn-primary">
              + New Agent
            </Link>
            <Link href="/chat-hub" className="db2-btn-ghost">
              💬 Chat
            </Link>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="db2-stats-row">
          <div className="db2-stat-card">
            <div className="db2-stat-icon-wrap db2-stat-warm">🤖</div>
            <div className="db2-stat-body">
              <div className="db2-stat-num">{agentsLoading ? '—' : userAgents.length}</div>
              <div className="db2-stat-label">My Agents</div>
            </div>
          </div>
          <div className="db2-stat-card">
            <div className="db2-stat-icon-wrap db2-stat-green">✅</div>
            <div className="db2-stat-body">
              <div className="db2-stat-num">{completedTasks}</div>
              <div className="db2-stat-label">Tasks Done</div>
            </div>
          </div>
          <div className="db2-stat-card">
            <div className="db2-stat-icon-wrap db2-stat-blue">📋</div>
            <div className="db2-stat-body">
              <div className="db2-stat-num">{activeTasks}</div>
              <div className="db2-stat-label">Active Tasks</div>
            </div>
          </div>
          <div className="db2-stat-card">
            <div className="db2-stat-icon-wrap db2-stat-purple">🛍</div>
            <div className="db2-stat-body">
              <div className="db2-stat-num">20+</div>
              <div className="db2-stat-label">Models Available</div>
            </div>
          </div>
        </div>

        {/* ── Content Grid ── */}
        <div className="db2-content-grid">

          {/* Left — Agents Section */}
          <div className="db2-main-col">
            <div className="db2-section-head">
              <div>
                <p className="db2-section-eyebrow">MY AGENTS</p>
                <h2 className="db2-section-title">Your AI Workforce</h2>
              </div>
              <Link href="/agents" className="db2-view-all">View all →</Link>
            </div>

            {agentsLoading ? (
              <div className="db2-agent-grid">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="db2-agent-skeleton" />
                ))}
              </div>
            ) : userAgents.length === 0 ? (
              <EmptyAgents />
            ) : (
              <div className="db2-agent-grid">
                {userAgents.slice(0, 6).map((agent) => (
                  <AgentCard key={agent._id} agent={agent} />
                ))}
              </div>
            )}
          </div>

          {/* Right — Sidebar */}
          <aside className="db2-sidebar">

            {/* Profile Card */}
            <div className="db2-card">
              <p className="db2-card-eyebrow">{t('dashboard.profile')}</p>
              <div className="db2-profile-row">
                <div className="db2-avatar-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="db2-profile-name">{user.name}</div>
                  <div className="db2-profile-email">{user.email}</div>
                </div>
              </div>
              <div className="db2-profile-details">
                <div className="db2-detail-row">
                  <span className="db2-detail-key">Role</span>
                  <span className="db2-detail-val">{user.role || 'user'}</span>
                </div>
                {joinDate && (
                  <div className="db2-detail-row">
                    <span className="db2-detail-key">Joined</span>
                    <span className="db2-detail-val">{joinDate}</span>
                  </div>
                )}
                <div className="db2-detail-row">
                  <span className="db2-detail-key">Agents</span>
                  <span className="db2-detail-val">{userAgents.length}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="db2-card">
              <p className="db2-card-eyebrow">QUICK ACTIONS</p>
              <nav className="db2-quick-actions">
                <Link href="/agents" className="db2-action-row">
                  <span className="db2-action-emoji">🤖</span>
                  <span className="db2-action-label">Build an Agent</span>
                  <span className="db2-action-arrow">→</span>
                </Link>
                <Link href="/chat-hub" className="db2-action-row">
                  <span className="db2-action-emoji">💬</span>
                  <span className="db2-action-label">Open Chat Hub</span>
                  <span className="db2-action-arrow">→</span>
                </Link>
                <Link href="/marketplace" className="db2-action-row">
                  <span className="db2-action-emoji">🛍</span>
                  <span className="db2-action-label">Browse Models</span>
                  <span className="db2-action-arrow">→</span>
                </Link>
                <Link href="/discover-new" className="db2-action-row">
                  <span className="db2-action-emoji">🔬</span>
                  <span className="db2-action-label">Discover New</span>
                  <span className="db2-action-arrow">→</span>
                </Link>
              </nav>
            </div>

          </aside>
        </div>
      </div>
    </main>
  );
}

/* ── Agent Card ── */
function AgentCard({ agent }) {
  return (
    <div className="db2-agent-card">
      <div className="db2-agent-card-header">
        <div className="db2-agent-icon-wrap">
          {agent.icon || '🤖'}
        </div>
        <div className="db2-agent-card-info">
          <div className="db2-agent-card-name">{agent.name}</div>
          {agent.model && (
            <div className="db2-agent-card-model">{agent.model}</div>
          )}
        </div>
        {agent.isDefault && (
          <span className="db2-agent-default-badge">Default</span>
        )}
      </div>
      {agent.purpose && (
        <p className="db2-agent-purpose">{agent.purpose}</p>
      )}
      {agent.tags?.length > 0 && (
        <div className="db2-agent-tags">
          {agent.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="db2-agent-tag">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Empty Agents ── */
function EmptyAgents() {
  return (
    <div className="db2-empty-agents">
      <div className="db2-empty-emoji">🤖</div>
      <h3 className="db2-empty-title">No agents yet</h3>
      <p className="db2-empty-sub">
        Create your first AI agent to automate tasks and streamline your workflow.
      </p>
      <Link href="/agents" className="db2-btn-primary db2-empty-cta">
        + Create Agent
      </Link>
    </div>
  );
}
