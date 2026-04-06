/**
 * Counts models per marketplace category pill — logic must stay in sync with
 * frontend/src/lib/marketplaceFilters.js (category modes only, no sidebar filters).
 */

const CATEGORY_MODE_MAP = {
  language: ['Language', 'Translation', 'Multilingual'],
  vision: ['Multimodal', 'Vision'],
  code: ['Code'],
  imageGen: ['Image'],
  audio: ['Audio', 'Speech', 'Music', 'Voice'],
};

const TAB_IDS = ['all', 'language', 'vision', 'code', 'imageGen', 'audio', 'openSource'];

function matchesCategoryMode(m, mode) {
  if (!mode || mode === 'all') return true;
  if (mode === 'openSource') return !!m.openSource;
  const needles = CATEGORY_MODE_MAP[mode];
  if (!needles?.length) return false;
  const cats = m.categories || [];
  return needles.some((needle) => {
    const rx = new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    return cats.some((c) => rx.test(c));
  });
}

function tabCounts(models) {
  return TAB_IDS.map((id) => ({
    id,
    count:
      id === 'all'
        ? models.length
        : models.filter((m) => matchesCategoryMode(m, id)).length,
  }));
}

module.exports = { tabCounts, TAB_IDS };
