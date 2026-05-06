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
    setNotes(prev => [created, ...prev]);
    return created;
  };

  const deleteNote = async (id: string) => {
    await notesAPI.delete(id);
    setNotes(prev => prev.filter(note => note._id !== id));
  };

  return { notes, loading, addNote, deleteNote, refetch: fetchNotes };
}
