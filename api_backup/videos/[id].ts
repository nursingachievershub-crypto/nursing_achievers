import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../_lib/mongodb';
import { Video } from '../_lib/models';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectDB();
    const { id } = req.query;

    if (req.method === 'GET') {
      const video = await Video.findById(id);
      if (!video) return res.status(404).json({ error: 'Video not found' });
      return res.status(200).json(video);
    }

    if (req.method === 'DELETE') {
      await Video.findByIdAndDelete(id);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Video [id] error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
