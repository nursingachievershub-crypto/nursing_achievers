import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../_lib/mongodb';
import { Payment, Enrollment, User } from '../_lib/models';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectDB();
    const { id } = req.query;

    if (req.method === 'GET') {
      const payment = await Payment.findById(id);
      if (!payment) return res.status(404).json({ error: 'Payment not found' });
      return res.status(200).json(payment);
    }

    if (req.method === 'PATCH') {
      const { status } = req.body;
      const update: any = { status };
      if (status === 'approved' || status === 'rejected') {
        update.reviewedAt = new Date();
      }

      const payment = await Payment.findByIdAndUpdate(id, update, { new: true });
      if (!payment) return res.status(404).json({ error: 'Payment not found' });

      // On approval, create enrollments
      if (status === 'approved' && payment.courses?.length) {
        const user = await User.findOne({ email: payment.studentEmail.toLowerCase() });
        const userId = user?._id?.toString() || payment.studentEmail;

        for (const course of payment.courses) {
          await Enrollment.findOneAndUpdate(
            { userEmail: payment.studentEmail.toLowerCase(), courseId: course.title },
            { userId, userEmail: payment.studentEmail.toLowerCase(), courseId: course.title },
            { upsert: true, new: true }
          );
        }
      }

      return res.status(200).json(payment);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Payment [id] error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
