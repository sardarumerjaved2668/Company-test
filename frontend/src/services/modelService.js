import api from './api';
import fallbackModels from '../data/models.json';

let cachedModels = null;

/** Mirrors backend/src/utils/marketplaceTabCounts.js for offline / empty-DB fallbacks */
const CATEGORY_MODE_MAP = {
  language: ['Language', 'Translation', 'Multilingual'],
  vision: ['Multimodal', 'Vision'],
  code: ['Code'],
  imageGen: ['Image'],
  audio: ['Audio', 'Speech', 'Music', 'Voice'],
};

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

function tabCountsFromModels(models) {
  const TAB_IDS = ['all', 'language', 'vision', 'code', 'imageGen', 'audio', 'openSource'];
  return TAB_IDS.map((id) => ({
    id,
    count:
      id === 'all'
        ? models.length
        : models.filter((m) => matchesCategoryMode(m, id)).length,
  }));
}

function statsFromModels(models) {
  const map = {};
  models.forEach((m) => {
    const p = m.provider || 'Unknown';
    map[p] = (map[p] || 0) + 1;
  });
  const byProvider = Object.entries(map)
    .map(([provider, count]) => ({ provider, count }))
    .sort((a, b) => a.provider.localeCompare(b.provider));
  return { total: models.length, byProvider };
}

function fallbackPageResult() {
  const models = fallbackModels;
  return {
    models,
    total: models.length,
    page: 1,
    pages: 1,
  };
}

export async function fetchModelsPage(params = {}) {
  try {
    const { data } = await api.get('/models', {
      params: { limit: 500, ...params },
    });
    if (!data.success || !Array.isArray(data.models)) {
      return fallbackPageResult();
    }
    let models = data.models;
    if (models.length === 0) {
      return fallbackPageResult();
    }
    return {
      models,
      total: data.total ?? models.length,
      page: data.page ?? 1,
      pages: data.pages ?? 1,
    };
  } catch (err) {
    return fallbackPageResult();
  }
}

/** Used by home / chat-hub — all models, cached when unfiltered */
export async function fetchModels(params = {}) {
  const hasParams = Object.keys(params).length > 0;
  if (!hasParams && cachedModels) return cachedModels;

  try {
    const { models } = await fetchModelsPage(params);
    if (!hasParams) cachedModels = models;
    return models;
  } catch (_) {
    if (!hasParams) {
      cachedModels = fallbackModels;
      return cachedModels;
    }
    return [];
  }
}

export async function fetchMarketplaceTabCounts() {
  try {
    const { data } = await api.get('/models/marketplace-tabs');
    if (!data.success || !Array.isArray(data.tabs)) {
      const m = fallbackModels;
      return { total: m.length, tabs: tabCountsFromModels(m) };
    }
    const total = data.total ?? 0;
    if (total === 0) {
      const m = fallbackModels;
      return { total: m.length, tabs: tabCountsFromModels(m) };
    }
    return {
      total,
      tabs: data.tabs,
    };
  } catch {
    const m = fallbackModels;
    return { total: m.length, tabs: tabCountsFromModels(m) };
  }
}

export async function fetchModelStats() {
  try {
    const { data } = await api.get('/models/stats');
    if (!data.success) return statsFromModels(fallbackModels);
    const total = data.total ?? 0;
    if (total === 0) return statsFromModels(fallbackModels);
    return {
      total,
      byProvider: data.byProvider || [],
    };
  } catch {
    return statsFromModels(fallbackModels);
  }
}

export function clearModelCache() {
  cachedModels = null;
}
