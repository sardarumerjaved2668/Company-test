import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  fetchModelsPage,
  fetchModelStats,
  fetchMarketplaceTabCounts,
  clearModelCache,
} from '../services/modelService';
import { fetchAgents } from '../services/agentService';
import { filterRawModels } from '../lib/marketplaceFilters';

function useDebounced(value, ms) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function computeStarRating(m) {
  const vals = Object.values(m.scores || {}).filter(
    (x) => typeof x === 'number' && x > 0
  );
  if (!vals.length) return null;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return ((avg / 100) * 5).toFixed(1);
}

export function useMarketplace() {
  const [rawModels, setRawModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, byProvider: [] });
  const [tabCounts, setTabCounts] = useState(null);
  const [agents, setAgents] = useState([]);
  const [agentsLoading, setAgentsLoading] = useState(true);

  useEffect(() => {
    clearModelCache();
  }, []);

  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounced(searchInput, 280);

  const [categoryMode, setCategoryMode] = useState(null);
  const [selectedProviders, setSelectedProviders] = useState(() => new Set());
  const [pricingGroups, setPricingGroups] = useState(() => new Set());
  const [licence, setLicence] = useState(
    () => new Set(['commercial', 'openSource'])
  );
  const [maxInputPrice, setMaxInputPrice] = useState(100);
  const [minRating, setMinRating] = useState(0);
  const [labProvider, setLabProvider] = useState(null);

  const requestId = useRef(0);

  const loadModels = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchModelsPage({ limit: 500 });
      if (id !== requestId.current) return;
      setRawModels(result.models);
    } catch (e) {
      if (id !== requestId.current) return;
      setError(e.message || 'Failed to load models');
      setRawModels([]);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await fetchModelStats();
        if (!cancelled) setStats(s);
      } catch {
        if (!cancelled) setStats({ total: 0, byProvider: [] });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { total, tabs } = await fetchMarketplaceTabCounts();
        if (cancelled) return;
        const map = { all: total };
        tabs.forEach((t) => {
          if (t.id !== 'all') map[t.id] = t.count;
        });
        setTabCounts(map);
      } catch {
        if (!cancelled) setTabCounts(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setAgentsLoading(true);
      try {
        const a = await fetchAgents();
        if (!cancelled) setAgents(a);
      } catch {
        if (!cancelled) setAgents([]);
      } finally {
        if (!cancelled) setAgentsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRawModels = useMemo(
    () =>
      filterRawModels(rawModels, {
        search: debouncedSearch,
        categoryMode,
        labProvider,
        selectedProviders,
        pricingGroups,
        maxInputPrice,
        minRating,
        licence,
        starRatingFn: computeStarRating,
      }),
    [
      rawModels,
      debouncedSearch,
      categoryMode,
      labProvider,
      selectedProviders,
      pricingGroups,
      maxInputPrice,
      minRating,
      licence,
    ]
  );

  const toggleProvider = useCallback((name) => {
    setSelectedProviders((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const clearSelectedProviders = useCallback(() => {
    setSelectedProviders(new Set());
  }, []);

  const togglePricingGroup = useCallback((key) => {
    setPricingGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const toggleLicence = useCallback((key) => {
    setLicence((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchInput('');
    setCategoryMode(null);
    setLabProvider(null);
    setSelectedProviders(new Set());
    setPricingGroups(new Set());
    setLicence(new Set(['commercial', 'openSource']));
    setMaxInputPrice(100);
    setMinRating(0);
  }, []);

  return {
    rawModels,
    filteredRawModels,
    loading,
    error,
    stats,
    tabCounts,
    agents,
    agentsLoading,
    searchInput,
    setSearchInput,
    categoryMode,
    setCategoryMode,
    selectedProviders,
    toggleProvider,
    clearSelectedProviders,
    pricingGroups,
    togglePricingGroup,
    licence,
    toggleLicence,
    maxInputPrice,
    setMaxInputPrice,
    minRating,
    setMinRating,
    labProvider,
    setLabProvider,
    reload: loadModels,
    clearAllFilters,
  };
}
