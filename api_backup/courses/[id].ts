import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../_lib/mongodb';
import { Course } from '../_lib/models';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectDB();
    const { id } = req.query;

    if (req.method === 'GET') {
      const course = await Course.findById(id);
      if (!course) return res.status(404).json({ error: 'Course not found' });
      return res.status(200).json(course);
    }

    if (req.method === 'PUT') {
      const course = await Course.findByIdAndUpdate(id, req.body, { new: true });
      if (!course) return res.status(404).json({ error: 'Course not found' });
      return res.status(200).json(course);
    }

    if (req.method === 'DELETE') {
      await Course.findByIdAndDelete(id);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Course [id] error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
