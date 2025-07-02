import { useState, useEffect } from 'react';
import { getModules } from '../services/modules';

export const useModules = () => {
  const [modules, setModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadModules = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getModules();
      setModules(data);
    } catch (err) {
      setError('Failed to load modules');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, []);

  return {
    modules,
    loading,
    error,
    refetch: loadModules
  };
};