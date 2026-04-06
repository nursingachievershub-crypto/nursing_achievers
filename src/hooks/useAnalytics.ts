import { useState, useEffect, useCallback } from 'react';
import { analyticsAPI } from '../api/client';

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const data = await analyticsAPI.get();
      setAnalytics(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  return { analytics, loading, refetch: fetchAnalytics };
}
