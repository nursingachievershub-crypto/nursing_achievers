import { useState, useEffect, useCallback } from 'react';
import { coursesAPI } from '../api/client';

export function useCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await coursesAPI.getAll();
      setCourses(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const addCourse = async (data: any) => {
    const created = await coursesAPI.create(data);
    setCourses(prev => [...prev, created]);
    return created;
  };

  const updateCourse = async (id: string, data: any) => {
    const updated = await coursesAPI.update(id, data);
    setCourses(prev => prev.map(c => (c._id === id ? updated : c)));
    return updated;
  };

  const deleteCourse = async (id: string) => {
    await coursesAPI.delete(id);
    setCourses(prev => prev.filter(c => c._id !== id));
  };

  return { courses, loading, addCourse, updateCourse, deleteCourse, refetch: fetchCourses };
}
