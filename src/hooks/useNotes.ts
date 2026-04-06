import { useState, useEffect, useCallback } from 'react';
import { notesAPI } from '../api/client';

export function useNotes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notesAPI.getAll();
      setNotes(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const addNote = async (data: any) => {
    const created = await notesAPI.create(data);
    setNotes(prev => [...prev, created]);
    return created;
  };

  return { notes, loading, addNote, refetch: fetchNotes };
}
