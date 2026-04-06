import api from './api';

export async function fetchAgents() {
  const { data } = await api.get('/agents');
  return data.success && Array.isArray(data.agents) ? data.agents : [];
}
