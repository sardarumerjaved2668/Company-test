import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useAuthModal } from '../context/AuthModalContext';
import { usePathname } from 'next/navigation';
import {
  fetchMyWorkspace,
  fetchMyWorkspaceLocal,
  createUserAgent,
  createUserAgentLocal,
  updateUserAgent,
  updateUserAgentLocal,
  deleteUserAgent,
  deleteUserAgentLocal,
  createAgentTask,
  createAgentTaskLocal,
  updateAgentTask,
  updateAgentTaskLocal,
  deleteAgentTask,
  deleteAgentTaskLocal,
} from '../services/agentService';

export function useAgentWorkspace() {
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const pathname = usePathname();
  const [userAgents, setUserAgents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (user) {
        const data = await fetchMyWorkspace();
        setUserAgents(data.userAgents);
        setTasks(data.tasks);
      } else {
        const data = fetchMyWorkspaceLocal();
        setUserAgents(data.userAgents);
        setTasks(data.tasks);
      }
    } catch (e) {
      setError(e.message || 'Failed to load workspace');
      if (!user) {
        const data = fetchMyWorkspaceLocal();
        setUserAgents(data.userAgents);
        setTasks(data.tasks);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const requireAuth = useCallback(() => {
    if (!user) {
      openAuthModal({ tab: 'signin', returnTo: pathname || '/agents' });
      return false;
    }
    return true;
  }, [user, openAuthModal, pathname]);

  const addAgent = async (body) => {
    if (!user) {
      const a = createUserAgentLocal(body);
      await refresh();
      return a;
    }
    const a = await createUserAgent(body);
    await refresh();
    return a;
  };

  const patchAgent = async (id, body) => {
    if (!user) {
      const a = updateUserAgentLocal(id, body);
      await refresh();
      return a;
    }
    const a = await updateUserAgent(id, body);
    await refresh();
    return a;
  };

  const removeAgent = async (id) => {
    if (!user) {
      deleteUserAgentLocal(id);
      await refresh();
      return;
    }
    await deleteUserAgent(id);
    await refresh();
  };

  const addTask = async (agentId, title) => {
    if (!user) {
      const t = createAgentTaskLocal(agentId, title);
      await refresh();
      return t;
    }
    const t = await createAgentTask(agentId, title);
    await refresh();
    return t;
  };

  const patchTask = async (taskId, body) => {
    if (!user) {
      const t = updateAgentTaskLocal(taskId, body);
      await refresh();
      return t;
    }
    const t = await updateAgentTask(taskId, body);
    await refresh();
    return t;
  };

  const removeTask = async (taskId) => {
    if (!user) {
      deleteAgentTaskLocal(taskId);
      await refresh();
      return;
    }
    await deleteAgentTask(taskId);
    await refresh();
  };

  return {
    userAgents,
    tasks,
    loading,
    error,
    refresh,
    addAgent,
    patchAgent,
    removeAgent,
    addTask,
    patchTask,
    removeTask,
    requireAuth,
    isAuthenticated: !!user,
  };
}
