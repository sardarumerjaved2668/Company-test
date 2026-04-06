/**
 * Normalizes model reference entries (legacy string[] or { name, icon }).
 */
function normalizeModels(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((x) => {
    if (typeof x === 'string') return { name: x, icon: 'robot' };
    const name = x && typeof x.name === 'string' ? x.name : '';
    const icon = x && typeof x.icon === 'string' ? x.icon : 'robot';
    return { name, icon };
  }).filter((m) => m.name);
}

function arxivIdFromUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const m = url.match(/arxiv\.org\/abs\/([\d.]+)/i);
  return m ? m[1] : '';
}

function parseLegacyImpact(impact) {
  if (!impact || typeof impact !== 'string') return { level: 'Medium', description: '' };
  const s = impact.trim();
  const match = /^(Low|Medium|High)\s*[—–-]\s*(.+)$/i.exec(s);
  if (match) {
    const level = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
    const normalized = ['Low', 'Medium', 'High'].includes(level) ? level : 'Medium';
    return { level: normalized, description: (match[2] || '').trim() };
  }
  return { level: 'Medium', description: s };
}

/**
 * Maps a Mongo discover document to the public API shape (matches UI contract).
 */
function toDiscoverItemDto(doc) {
  const o = doc && typeof doc.toObject === 'function' ? doc.toObject() : { ...(doc || {}) };
  const id = o._id ? String(o._id) : '';
  let arxivId = o.arxivId || '';
  if (!arxivId && o.arxivUrl) arxivId = arxivIdFromUrl(o.arxivUrl);

  let impactLevel = o.impactLevel;
  let impactDescription = (o.impactDescription || '').trim();
  const legacy = parseLegacyImpact(o.impact || '');
  if (!impactLevel) impactLevel = legacy.level;
  if (!impactDescription) impactDescription = legacy.description;
  if (!['Low', 'Medium', 'High'].includes(impactLevel)) impactLevel = 'Medium';

  return {
    id,
    source: o.lab,
    publishDate: o.publishDate,
    category: o.category || 'reasoning',
    title: o.title,
    snippet: o.summary,
    arxivId,
    arxivUrl: o.arxivUrl || (arxivId ? `https://arxiv.org/abs/${arxivId}` : ''),
    authors: Array.isArray(o.authors) ? o.authors : [],
    keyFindings: Array.isArray(o.keyFindings) ? o.keyFindings : [],
    modelsReferenced: normalizeModels(o.modelsReferenced),
    impactLevel,
    impactDescription,
    citation: o.citation || '',
  };
}

module.exports = {
  toDiscoverItemDto,
  normalizeModels,
  arxivIdFromUrl,
};
