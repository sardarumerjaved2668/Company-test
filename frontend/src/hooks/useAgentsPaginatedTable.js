import { useState, useEffect } from 'react';
import { fetchMyAgentsPaginated, paginateLocalUserAgents } from '../services/agentService';

/**
 * Paginated user agents for the agents page table (API when logged in, else local slice).
 */
export function useAgentsPaginatedTable({
  isAuthenticated,
  localAgents,
  page,
  pageSize,
  agentQuery,
  sortBy,
  sortDir,
  refreshNonce,
}) {
  const [userAgents, setUserAgents] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        if (isAuthenticated) {
          const d = await fetchMyAgentsPaginated({
            page,
            pageSize,
            q: agentQuery,
            sortBy,
            sortDir,
          });
          if (!cancelled) {
            setUserAgents(d.userAgents);
            setTotal(d.total);
            setTotalPages(d.totalPages);
          }
        } else {
          const d = paginateLocalUserAgents(localAgents, {
            page,
            pageSize,
            q: agentQuery,
            sortBy,
            sortDir,
          });
          if (!cancelled) {
            setUserAgents(d.userAgents);
            setTotal(d.total);
            setTotalPages(d.totalPages);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message || 'Failed to load agents');
          setUserAgents([]);
          setTotal(0);
          setTotalPages(1);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    isAuthenticated,
    page,
    pageSize,
    agentQuery,
    sortBy,
    sortDir,
    refreshNonce,
    localAgents,
  ]);

  return { userAgents, total, totalPages, loading, error };
}
