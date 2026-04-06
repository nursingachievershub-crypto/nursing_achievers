import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../_lib/mongodb';
import { Quiz } from '../_lib/models';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectDB();
    const { id } = req.query;

    if (req.method === 'GET') {
      const quiz = await Quiz.findById(id);
      if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
      return res.status(200).json(quiz);
    }

    if (req.method === 'DELETE') {
      await Quiz.findByIdAndDelete(id);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Quiz [id] error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
