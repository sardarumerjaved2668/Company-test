import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchWorkbenchSuggestions } from '../services/agentService';

const DEFAULT_PAGE_SIZE = 10;

export function useWorkbenchSearch(initialCategory = 'use_cases', initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const [suggestions, setSuggestions] = useState([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  const refresh = useCallback(
    async (q, cat, shuffle = false, pageNum = page, ps = pageSize) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchWorkbenchSuggestions(q, cat, shuffle, pageNum, ps);
        setSuggestions(res.suggestions);
        setTotalMatches(res.totalMatches);
        setTotalPages(res.totalPages ?? 1);
      } catch (e) {
        setError(e.message || 'Failed to load suggestions');
        setSuggestions([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [page, pageSize]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      refresh(query, category, false, page, pageSize);
    }, 280);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, category, page, pageSize, refresh]);

  const shuffle = useCallback(() => {
    refresh(query, category, true, 1, pageSize);
    setPage(1);
  }, [query, category, pageSize, refresh]);

  useEffect(() => {
    setPage(1);
  }, [category]);

  useEffect(() => {
    setPage((p) => Math.max(1, Math.min(p, Math.max(1, totalPages))));
  }, [totalPages]);

  return {
    query,
    setQuery,
    category,
    setCategory,
    suggestions,
    totalMatches,
    totalPages,
    page,
    setPage,
    pageSize,
    loading,
    error,
    refresh: () => refresh(query, category, false, page, pageSize),
    shuffle,
  };
}
