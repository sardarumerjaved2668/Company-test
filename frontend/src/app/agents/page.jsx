'use client';

const AGENT_TEMPLATES = [
  {
    id: 'research',
    title: 'Research Agent',
    description: 'Automates web research, summarises findings, and generates structured reports on demand.',
    model: 'GPT‑4.5',
    tags: ['Reports', 'Web search'],
  },
  {
    id: 'support',
    title: 'Customer Support Agent',
    description: 'Handles tickets, FAQs, and escalates complex issues with a full conversation context.',
    model: 'GPT‑4.5',
    tags: ['Support', 'Ticketing'],
  },
  {
    id: 'review',
    title: 'Code Review Agent',
    description: 'Reviews pull requests, flags bugs, suggests improvements, and explains changes inline.',
    model: 'Claude Opus 4.5',
    tags: ['Code', 'GitHub'],
  },
  {
    id: 'analysis',
    title: 'Data Analysis Agent',
    description: 'Processes spreadsheets, generates insights, creates visualisations, and answers data questions.',
    model: 'Gemini',
    tags: ['Spreadsheets', 'Charts'],
  },
  {
    id: 'content',
    title: 'Content Writer Agent',
    description: 'Creates blog posts, social content, and marketing copy tuned to your brand voice.',
    model: 'GPT‑4.1',
    tags: ['Content', 'Marketing'],
  },
];

export default function AgentsPage() {
  return (
    <main>
      <div className="app-wrapper mk-app-full">
        <section className="ag-header">
          <div>
            <h1 className="ag-title">Agent Builder</h1>
            <p className="ag-sub">
              Create powerful AI agents using any model. Pick a template or start from scratch.
            </p>
          </div>
        </section>

        <section className="ag-shell">
          {/* Left: new agent button */}
          <aside className="ag-left-rail">
            <button type="button" className="ag-new-btn">
              + New Agent
            </button>
          </aside>

          {/* Center: empty builder canvas */}
          <section className="ag-canvas">
            <div className="ag-canvas-inner">
              <div className="ag-canvas-hint">
                <h2>Not sure where to start?</h2>
                <p>
                  Chat with our AI guide — describe what you want your agent to do and get a
                  personalised setup plan.
                </p>
                <button type="button" className="ag-ask-btn">
                  Ask the Hub →
                </button>
              </div>
            </div>
          </section>

          {/* Right: agent templates */}
          <aside className="ag-templates">
            <h2 className="ag-templates-title">Agent templates</h2>
            <div className="ag-templates-grid">
              {AGENT_TEMPLATES.map((tpl) => (
                <article key={tpl.id} className="ag-template-card">
                  <div className="ag-template-icon">📄</div>
                  <h3 className="ag-template-title">{tpl.title}</h3>
                  <p className="ag-template-desc">{tpl.description}</p>
                  <div className="ag-template-meta">
                    <span className="ag-template-model">{tpl.model}</span>
                    <div className="ag-template-tags">
                      {tpl.tags.map((tag) => (
                        <span key={tag} className="ag-template-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button type="button" className="ag-template-link">
                    Use template →
                  </button>
                </article>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

