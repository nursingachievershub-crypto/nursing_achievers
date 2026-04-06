import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../_lib/mongodb';
import { User } from '../_lib/models';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectDB();

    // POST /api/auth — login / register
    if (req.method === 'POST') {
      const { email, name, avatar, loginType } = req.body;
      if (!email || !name) return res.status(400).json({ error: 'email and name required' });

      const user = await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        { email: email.toLowerCase(), name, avatar, loginType },
        { upsert: true, new: true }
      );
      return res.status(200).json(user);
    }

    // GET /api/auth?email=x — get profile
    if (req.method === 'GET') {
      const { email } = req.query;
      if (!email) return res.status(400).json({ error: 'email required' });
      const user = await User.findOne({ email: (email as string).toLowerCase() });
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.status(200).json(user);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
