import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../_lib/mongodb';
import { User, Course, Video, Quiz, Note, Payment, Enrollment } from '../_lib/models';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await connectDB();

    const [totalStudents, totalCourses, totalVideos, totalQuizzes, totalNotes, payments, enrollments] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Video.countDocuments(),
      Quiz.countDocuments(),
      Note.countDocuments(),
      Payment.find().sort({ createdAt: -1 }).limit(50).lean(),
      Enrollment.countDocuments(),
    ]);

    const approvedPayments = (payments as any[]).filter(p => p.status === 'approved');
    const totalRevenue = approvedPayments.reduce((sum, p) => sum + (p.total || 0), 0);
    const pendingPayments = (payments as any[]).filter(p => p.status === 'pending').length;

    return res.status(200).json({
      overview: {
        totalStudents,
        totalCourses,
        totalVideos,
        totalQuizzes,
        totalNotes,
        totalRevenue,
        pendingPayments,
        totalEnrollments: enrollments,
      },
      recentPayments: (payments as any[]).slice(0, 10),
    });
  } catch (error: any) {
    console.error('Analytics error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
