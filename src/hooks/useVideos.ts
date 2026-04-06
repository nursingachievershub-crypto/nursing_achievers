import { useState, useEffect, useCallback } from 'react';
import { videosAPI } from '../api/client';

export function useVideos() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await videosAPI.getAll();
      setVideos(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  const addVideo = async (data: any) => {
    const created = await videosAPI.create(data);
    setVideos(prev => [...prev, created]);
    return created;
  };

  return { videos, loading, addVideo, refetch: fetchVideos };
}
