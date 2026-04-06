import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../_lib/mongodb';
import { Note } from '../_lib/models';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectDB();
    const { id } = req.query;

    if (req.method === 'GET') {
      const note = await Note.findById(id);
      if (!note) return res.status(404).json({ error: 'Note not found' });
      return res.status(200).json(note);
    }

    if (req.method === 'DELETE') {
      await Note.findByIdAndDelete(id);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Note [id] error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
