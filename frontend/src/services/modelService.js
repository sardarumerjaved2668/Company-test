import api from './api';
import fallbackModels from '../data/models.json';

let cachedModels = null;

export async function fetchModels() {
  if (cachedModels) return cachedModels;

  try {
    const { data } = await api.get('/models');
    if (data.success && Array.isArray(data.data) && data.data.length > 0) {
      cachedModels = data.data;
      return cachedModels;
    }
  } catch (_) {
    // API unavailable — fall through to local data
  }

  cachedModels = fallbackModels;
  return cachedModels;
}

export function clearModelCache() {
  cachedModels = null;
}
