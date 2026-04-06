import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../_lib/mongodb';
import { Note } from '../_lib/models';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectDB();

    if (req.method === 'GET') {
      const { courseId } = req.query;
      const filter = courseId ? { courseId } : {};
      const notes = await Note.find(filter).sort({ createdAt: -1 });
      return res.status(200).json(notes);
    }

    if (req.method === 'POST') {
      const note = await Note.create(req.body);
      return res.status(201).json(note);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Notes error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
