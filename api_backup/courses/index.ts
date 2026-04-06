import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../_lib/mongodb';
import { Course } from '../_lib/models';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectDB();

    if (req.method === 'GET') {
      const courses = await Course.find().sort({ createdAt: -1 });
      return res.status(200).json(courses);
    }

    if (req.method === 'POST') {
      const course = await Course.create(req.body);
      return res.status(201).json(course);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Courses error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
