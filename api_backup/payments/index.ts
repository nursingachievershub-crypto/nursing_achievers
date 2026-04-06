import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../_lib/mongodb';
import { Payment } from '../_lib/models';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectDB();

    if (req.method === 'GET') {
      const { email } = req.query;
      const filter = email ? { studentEmail: (email as string).toLowerCase() } : {};
      const payments = await Payment.find(filter).sort({ createdAt: -1 });
      return res.status(200).json(payments);
    }

    if (req.method === 'POST') {
      const payment = await Payment.create(req.body);
      return res.status(201).json(payment);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Payments error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
