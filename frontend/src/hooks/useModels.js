import { useState, useEffect } from 'react';
import { fetchModels } from '../services/modelService';

export function useModels() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchModels();
        if (!cancelled) setModels(data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load models');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { models, loading, error };
}
