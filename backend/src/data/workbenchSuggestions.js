/**
 * Category ids match frontend filter chips.
 * Each suggestion is searchable by `text` (lowercase match against query).
 */
const CATEGORIES = [
  'use_cases',
  'build_business',
  'help_learn',
  'monitor',
  'research',
  'create_content',
  'analyze_research',
];

const SUGGESTIONS = {
  use_cases: [
    { id: 'uc1', icon: '🚀', text: 'Build a space exploration timeline app' },
    { id: 'uc2', icon: '📈', text: 'Create a real-time stock market tracker' },
    { id: 'uc3', icon: '🤖', text: 'Prototype an AI chatbot demo application' },
    { id: 'uc4', icon: '📋', text: 'Create a project management Kanban board' },
    { id: 'uc5', icon: '🧭', text: 'Design an onboarding checklist for new hires' },
    { id: 'uc6', icon: '🎮', text: 'Build a browser mini-game with scoreboard' },
  ],
  build_business: [
    { id: 'bb1', icon: '💼', text: 'Draft a one-page business plan outline' },
    { id: 'bb2', icon: '📣', text: 'Write a launch email sequence for a SaaS' },
    { id: 'bb3', icon: '💰', text: 'Model simple revenue projections from assumptions' },
    { id: 'bb4', icon: '🤝', text: 'Create a partner outreach template' },
    { id: 'bb5', icon: '📊', text: 'Summarise competitor positioning from notes' },
  ],
  help_learn: [
    { id: 'hl1', icon: '📚', text: 'Explain a concept with examples and analogies' },
    { id: 'hl2', icon: '❓', text: 'Generate practice quiz questions on a topic' },
    { id: 'hl3', icon: '🗺️', text: 'Build a 7-day study plan for an exam' },
    { id: 'hl4', icon: '📝', text: 'Turn lecture notes into flashcard bullets' },
  ],
  monitor: [
    { id: 'mo1', icon: '👁️', text: 'Summarise daily news in my focus areas' },
    { id: 'mo2', icon: '🔔', text: 'Track mentions of a product across forums' },
    { id: 'mo3', icon: '📉', text: 'Alert when metrics cross a threshold' },
    { id: 'mo4', icon: '🛡️', text: 'Review policy changes affecting my industry' },
  ],
  research: [
    { id: 're1', icon: '🔍', text: 'Compare sources on a controversial claim' },
    { id: 're2', icon: '📄', text: 'Extract citations from a long PDF topic' },
    { id: 're3', icon: '🌐', text: 'Build a reading list from a research question' },
    { id: 're4', icon: '🧪', text: 'Draft hypotheses for an A/B experiment' },
  ],
  create_content: [
    { id: 'cc1', icon: '✍️', text: 'Outline a blog post from bullet ideas' },
    { id: 'cc2', icon: '🎬', text: 'Write a short video script hook and beats' },
    { id: 'cc3', icon: '📱', text: 'Generate social posts from a press release' },
    { id: 'cc4', icon: '📧', text: 'Draft a newsletter section with CTAs' },
  ],
  analyze_research: [
    { id: 'ar1', icon: '📊', text: 'Analyse my spreadsheet data and generate insights' },
    { id: 'ar2', icon: '📉', text: 'Identify and visualise trends in my dataset' },
    { id: 'ar3', icon: '📑', text: 'Generate a structured analytical report from my data' },
    { id: 'ar4', icon: '💡', text: 'Generate business insights and recommendations' },
  ],
};

function listForCategory(category) {
  const key = CATEGORIES.includes(category) ? category : 'use_cases';
  return SUGGESTIONS[key] || SUGGESTIONS.use_cases;
}

/**
 * @param {string} category
 * @param {string} q trimmed query (may be empty)
 * @param {number} limit
 */
/** Full filtered pool (for pagination in memory when DB empty). */
function filterSuggestionPool(category, q, shuffle = false) {
  const list = listForCategory(category);
  const needle = (q || '').trim().toLowerCase();
  let pool = list;
  if (needle) {
    pool = list.filter((item) => item.text.toLowerCase().includes(needle));
    if (pool.length === 0) {
      pool = list.filter(
        (item) =>
          needle.split(/\s+/).some((w) => w.length > 2 && item.text.toLowerCase().includes(w))
      );
    }
    if (pool.length === 0) pool = list;
  }
  let ordered = pool;
  if (shuffle) {
    ordered = [...pool].sort(() => Math.random() - 0.5);
  }
  return {
    items: ordered,
    total: pool.length,
    category: CATEGORIES.includes(category) ? category : 'use_cases',
  };
}

function filterSuggestions(category, q, limit = 4, shuffle = false) {
  const { items, total, category: cat } = filterSuggestionPool(category, q, shuffle);
  return {
    items: items.slice(0, limit),
    total,
    category: cat,
  };
}

function paginateMemory(category, q, page, pageSize, shuffle) {
  const { items, total, category: resolvedCategory } = filterSuggestionPool(category, q, shuffle);
  const p = Math.max(1, page);
  const ps = Math.max(1, pageSize);
  const skip = (p - 1) * ps;
  return {
    suggestions: items.slice(skip, skip + ps).map((row) => ({
      id: row.id,
      icon: row.icon,
      text: row.text,
    })),
    totalMatches: total,
    page: p,
    pageSize: ps,
    totalPages: Math.max(1, Math.ceil(total / ps)),
    category: resolvedCategory,
  };
}

module.exports = {
  CATEGORIES,
  SUGGESTIONS,
  listForCategory,
  filterSuggestions,
  filterSuggestionPool,
  paginateMemory,
};
