import api from './api';
import fallbackModels from '../data/models.json';

let cachedModels = null;

/**
 * @param {Record<string, string|number|boolean|undefined>} [params] query params for GET /api/models
 * @returns {Promise<{ models: unknown[], total: number, page: number, pages: number }>}
 */
function apiErrorMessage(err, fallback) {
  if (err?.response?.data?.message) return String(err.response.data.message);
  const code = err?.code;
  const msg = err?.message;
  if (
    code === 'ERR_NETWORK' ||
    code === 'ECONNREFUSED' ||
    msg === 'Network Error'
  ) {
    return (
      'Cannot reach the API. Start the backend (port 5000), ensure NEXT_PUBLIC_API_URL matches it, ' +
      'and run `npm run seed` in the backend folder if the database is empty.'
    );
  }
  return msg || fallback;
}

export async function fetchModelsPage(params = {}) {
  try {
    const { data } = await api.get('/models', {
      params: { limit: 500, ...params },
    });
    if (!data.success || !Array.isArray(data.models)) {
      throw new Error(data.message || 'Failed to load models');
    }
    return {
      models: data.models,
      total: data.total ?? data.models.length,
      page: data.page ?? 1,
      pages: data.pages ?? 1,
    };
  } catch (err) {
    throw new Error(apiErrorMessage(err, 'Failed to load models'));
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
      throw new Error(data.message || 'Failed to load marketplace tabs');
    }
    return {
      total: data.total ?? 0,
      tabs: data.tabs,
    };
  } catch (err) {
    throw new Error(apiErrorMessage(err, 'Failed to load marketplace tabs'));
  }
}

export async function fetchModelStats() {
  try {
    const { data } = await api.get('/models/stats');
    if (!data.success) throw new Error('Failed to load stats');
    return {
      total: data.total,
      byProvider: data.byProvider || [],
    };
  } catch (err) {
    throw new Error(apiErrorMessage(err, 'Failed to load stats'));
  }
}

export function clearModelCache() {
  cachedModels = null;
}
