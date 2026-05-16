import { useState, useEffect, useCallback } from 'react';
import { quizzesAPI } from '../api/client';

export function useQuizzes() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await quizzesAPI.getAll();
      setQuizzes(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchQuizzes(); }, [fetchQuizzes]);

  const addQuiz = async (data: any) => {
    const created = await quizzesAPI.create(data);
    setQuizzes(prev => [...prev, created]);
    return created;
  };

  const deleteQuiz = async (id: string) => {
    await quizzesAPI.delete(id);
    setQuizzes(prev => prev.filter(q => q._id !== id && q.id !== id));
  };

  return { quizzes, loading, addQuiz, deleteQuiz, refetch: fetchQuizzes };
}
