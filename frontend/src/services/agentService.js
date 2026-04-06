import api from './api';

const LS_KEY = 'nexusai:agentWorkspace:v1';

function pickAgents(payload) {
  const agents = payload?.data?.agents ?? payload?.agents;
  return payload?.success && Array.isArray(agents) ? agents : [];
}

export async function fetchAgents() {
  const { data } = await api.get('/agents');
  return pickAgents(data);
}

/** Toolbar actions from backend (category + query hints for suggestions). */
export async function fetchWorkbenchToolbar() {
  const { data } = await api.get('/agents/workbench/toolbar');
  if (!data.success || !data.data?.actions) return [];
  return data.data.actions;
}

export async function fetchWorkbenchSuggestions(
  q,
  category,
  shuffle = false,
  page = 1,
  pageSize = 10
) {
  const { data } = await api.get('/agents/suggestions', {
    params: {
      q: q || '',
      category: category || 'use_cases',
      shuffle: shuffle ? '1' : undefined,
      page,
      pageSize,
    },
  });
  if (!data.success || !data.data) {
    return {
      suggestions: [],
      totalMatches: 0,
      category: category || 'use_cases',
      page: 1,
      pageSize,
      totalPages: 1,
    };
  }
  return {
    suggestions: data.data.suggestions || [],
    totalMatches: data.data.totalMatches ?? 0,
    category: data.data.category || 'use_cases',
    page: data.data.page ?? 1,
    pageSize: data.data.pageSize ?? pageSize,
    totalPages: data.data.totalPages ?? 1,
  };
}

export async function fetchMyAgentsPaginated({ page = 1, pageSize = 10, q = '', sortBy = 'updatedAt', sortDir = 'desc' }) {
  const { data } = await api.get('/agents/me/agents', {
    params: { page, pageSize, q, sortBy, sortDir },
  });
  if (!data.success || !data.data) {
    return { userAgents: [], total: 0, page: 1, pageSize, totalPages: 1 };
  }
  return {
    userAgents: data.data.userAgents || [],
    total: data.data.total ?? 0,
    page: data.data.page ?? page,
    pageSize: data.data.pageSize ?? pageSize,
    totalPages: data.data.totalPages ?? 1,
  };
}

export function paginateLocalUserAgents(userAgents, { page, pageSize, q, sortBy, sortDir }) {
  let list = [...(userAgents || [])];
  if (q) {
    const n = q.toLowerCase();
    list = list.filter(
      (a) =>
        (a.name && a.name.toLowerCase().includes(n)) ||
        (a.model && a.model.toLowerCase().includes(n)) ||
        (a.templateId && String(a.templateId).toLowerCase().includes(n)) ||
        (a.purpose && a.purpose.toLowerCase().includes(n))
    );
  }
  if (sortBy === 'name') {
    list.sort((a, b) => {
      const cmp = (a.name || '').localeCompare(b.name || '');
      return sortDir === 'asc' ? cmp : -cmp;
    });
  } else {
    list.sort((a, b) => {
      const ta = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const tb = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return sortDir === 'asc' ? ta - tb : tb - ta;
    });
  }
  const total = list.length;
  const p = Math.max(1, page);
  const ps = Math.max(1, pageSize);
  const skip = (p - 1) * ps;
  return {
    userAgents: list.slice(skip, skip + ps),
    total,
    page: p,
    pageSize: ps,
    totalPages: Math.max(1, Math.ceil(total / ps)),
  };
}

export async function fetchSystemAgentsPage({ page = 1, pageSize = 10, q = '' }) {
  const { data } = await api.get('/agents', {
    params: { page, pageSize, q },
  });
  if (!data.success || !data.data) {
    return { agents: [], total: 0, page: 1, pageSize, totalPages: 1 };
  }
  const d = data.data;
  if (d.total != null && Array.isArray(d.agents)) {
    return {
      agents: d.agents,
      total: d.total,
      page: d.page ?? page,
      pageSize: d.pageSize ?? pageSize,
      totalPages: d.totalPages ?? 1,
    };
  }
  const agents = d.agents || [];
  return {
    agents,
    total: agents.length,
    page: 1,
    pageSize: agents.length || pageSize,
    totalPages: 1,
  };
}

function readLocalWorkspace() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeLocalWorkspace(state) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function ensureLocalDefault() {
  const existing = readLocalWorkspace();
  if (existing?.userAgents?.length) return existing;
  const id = `local-${Date.now()}`;
  const state = {
    userAgents: [
      {
        _id: id,
        name: 'Default Assistant',
        templateId: 'research',
        purpose: 'Automates research and summarises findings.',
        systemPrompt: '',
        model: 'GPT-4o',
        tags: ['Research', 'Reports'],
        icon: '🔬',
        isDefault: true,
      },
    ],
    tasks: [],
  };
  writeLocalWorkspace(state);
  return state;
}

export async function fetchMyWorkspace() {
  const { data } = await api.get('/agents/me');
  if (!data.success || !data.data) return { userAgents: [], tasks: [] };
  return {
    userAgents: data.data.userAgents || [],
    tasks: data.data.tasks || [],
  };
}

export function fetchMyWorkspaceLocal() {
  return ensureLocalDefault();
}

function apiErrorMessage(error, fallback) {
  const msg = error?.response?.data?.message;
  if (typeof msg === 'string' && msg.trim()) return msg.trim();
  if (Array.isArray(msg) && msg[0]?.msg) return String(msg[0].msg);
  if (error?.message && typeof error.message === 'string') return error.message;
  return fallback;
}

export async function createUserAgent(body) {
  try {
    const { data } = await api.post('/agents/me', body);
    if (!data?.success || !data.data?.userAgent) {
      throw new Error(data?.message || 'Failed to create agent');
    }
    return data.data.userAgent;
  } catch (e) {
    throw new Error(apiErrorMessage(e, 'Could not create agent. Check your connection and try again.'));
  }
}

export function createUserAgentLocal(body) {
  const ws = ensureLocalDefault();
  const agent = {
    _id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: body.name,
    templateId: body.templateId || '',
    purpose: body.purpose || '',
    systemPrompt: body.systemPrompt || '',
    model: body.model,
    tags: body.tags || [],
    icon: body.icon || '🤖',
    isDefault: false,
  };
  ws.userAgents.push(agent);
  writeLocalWorkspace(ws);
  return agent;
}

export async function updateUserAgent(id, body) {
  const { data } = await api.patch(`/agents/me/${id}`, body);
  if (!data.success) throw new Error(data.message || 'Failed to update agent');
  return data.data.userAgent;
}

export function updateUserAgentLocal(id, body) {
  const ws = ensureLocalDefault();
  const agent = ws.userAgents.find((a) => a._id === id);
  if (!agent) throw new Error('Agent not found');
  if (body.name !== undefined) agent.name = body.name;
  if (body.purpose !== undefined) agent.purpose = body.purpose;
  if (body.systemPrompt !== undefined) agent.systemPrompt = body.systemPrompt;
  if (body.model !== undefined) agent.model = body.model;
  if (body.tags !== undefined) agent.tags = body.tags;
  if (body.icon !== undefined) agent.icon = body.icon;
  if (body.isDefault === true) {
    ws.userAgents.forEach((a) => {
      a.isDefault = a._id === id;
    });
  }
  writeLocalWorkspace(ws);
  return agent;
}

export async function deleteUserAgent(id) {
  const { data } = await api.delete(`/agents/me/${id}`);
  if (!data.success) throw new Error(data.message || 'Failed to delete agent');
}

export function deleteUserAgentLocal(id) {
  const ws = ensureLocalDefault();
  const agent = ws.userAgents.find((a) => a._id === id);
  if (!agent) throw new Error('Agent not found');
  if (agent.isDefault) throw new Error('Cannot delete the default agent');
  ws.userAgents = ws.userAgents.filter((a) => a._id !== id);
  ws.tasks = ws.tasks.filter((t) => t.agent !== id);
  writeLocalWorkspace(ws);
}

export async function createAgentTask(agentId, title) {
  const { data } = await api.post(`/agents/me/${agentId}/tasks`, { title });
  if (!data.success) throw new Error(data.message || 'Failed to create task');
  return data.data.task;
}

export function createAgentTaskLocal(agentId, title) {
  const ws = ensureLocalDefault();
  const task = {
    _id: `local-t-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    agent: agentId,
    title: title.trim(),
    done: false,
    sortOrder: ws.tasks.filter((t) => t.agent === agentId).length,
  };
  ws.tasks.push(task);
  writeLocalWorkspace(ws);
  return task;
}

export async function updateAgentTask(taskId, body) {
  const { data } = await api.patch(`/agents/tasks/${taskId}`, body);
  if (!data.success) throw new Error(data.message || 'Failed to update task');
  return data.data.task;
}

export function updateAgentTaskLocal(taskId, body) {
  const ws = ensureLocalDefault();
  const task = ws.tasks.find((t) => t._id === taskId);
  if (!task) throw new Error('Task not found');
  if (body.title !== undefined) task.title = body.title;
  if (body.done !== undefined) task.done = body.done;
  writeLocalWorkspace(ws);
  return task;
}

export async function deleteAgentTask(taskId) {
  const { data } = await api.delete(`/agents/tasks/${taskId}`);
  if (!data.success) throw new Error(data.message || 'Failed to delete task');
}

export function deleteAgentTaskLocal(taskId) {
  const ws = ensureLocalDefault();
  ws.tasks = ws.tasks.filter((t) => t._id !== taskId);
  writeLocalWorkspace(ws);
}
