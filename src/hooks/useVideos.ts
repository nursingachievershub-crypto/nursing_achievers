import { useState, useEffect, useCallback } from 'react';
import { videosAPI } from '../api/client';

export function useVideos(courseId?: string) {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = useCallback(async () => {
    // Do not fetch if there's no courseId, matching your backend requirement
    if (!courseId) return; 
    
    try {
      setLoading(true);
      const data = await videosAPI.getAll(courseId);
      setVideos(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [courseId]);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  const addVideo = async (data: any) => {
    const created = await videosAPI.create({ ...data, courseId });
    setVideos(prev => [created, ...prev]);
    return created;
  };

  const deleteVideo = async (videoId: string) => {
    await videosAPI.delete(videoId);
    setVideos(prev => prev.filter(video => video._id !== videoId));
  };

  return { videos, loading, addVideo, deleteVideo, refetch: fetchVideos };
}