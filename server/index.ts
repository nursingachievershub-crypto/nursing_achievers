import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

import {
  User, Course, Video, Note, Quiz, QuizResult, Payment, Enrollment
} from './models.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ─── MongoDB Connection ──────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || '';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => { console.error('❌ MongoDB connection error:', err.message); });

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/auth', async (req, res) => {
  try {
    const { email, name, avatar, loginType } = req.body;
    if (!email || !name) return res.status(400).json({ error: 'email and name required' });
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { email: email.toLowerCase(), name, avatar, loginType },
      { upsert: true, new: true }
    );
    res.json(user);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/auth', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'email required' });
    const user = await User.findOne({ email: (email as string).toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// COURSES ROUTES
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/courses', async (_req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/courses', async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.put('/api/courses/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/courses/:id', async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// VIDEOS ROUTES
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/videos', async (req, res) => {
  try {
    const filter = req.query.courseId ? { courseId: req.query.courseId } : {};
    const videos = await Video.find(filter).sort({ createdAt: -1 });
    res.json(videos);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/videos', async (req, res) => {
  try {
    const video = await Video.create(req.body);
    res.status(201).json(video);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/videos/:id', async (req, res) => {
  try {
    await Video.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// NOTES ROUTES
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/notes', async (req, res) => {
  try {
    const filter = req.query.courseId ? { courseId: req.query.courseId } : {};
    const notes = await Note.find(filter).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/notes', async (req, res) => {
  try {
    const note = await Note.create(req.body);
    res.status(201).json(note);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// QUIZZES ROUTES
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/quizzes', async (req, res) => {
  try {
    const filter = req.query.courseId ? { courseId: req.query.courseId } : {};
    const quizzes = await Quiz.find(filter).sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/quizzes', async (req, res) => {
  try {
    // Submit quiz answers
    if (req.query.action === 'submit') {
      const { quizId, userId, userEmail, answers } = req.body;
      const quiz = await Quiz.findById(quizId);
      if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

      let score = 0;
      quiz.questions.forEach((q: any, i: number) => {
        if (answers[i] === q.answer) score++;
      });

      const result = await QuizResult.create({
        quizId, userId, userEmail, score,
        totalMarks: quiz.questions.length, answers,
      });
      return res.status(201).json(result);
    }

    // Create quiz
    const quiz = await Quiz.create(req.body);
    res.status(201).json(quiz);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/quizzes/:id', async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENTS ROUTES
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/payments', async (req, res) => {
  try {
    const filter = req.query.email ? { studentEmail: (req.query.email as string).toLowerCase() } : {};
    const payments = await Payment.find(filter).sort({ createdAt: -1 });
    res.json(payments);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/payments', async (req, res) => {
  try {
    const payment = await Payment.create(req.body);
    res.status(201).json(payment);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/payments/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const update: any = { status };
    if (status === 'approved' || status === 'rejected') update.reviewedAt = new Date();

    const payment = await Payment.findByIdAndUpdate(req.params.id, update, { new: true });
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

    res.json(payment);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS ROUTES
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/analytics', async (_req, res) => {
  try {
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

    res.json({
      overview: {
        totalStudents, totalCourses, totalVideos, totalQuizzes, totalNotes,
        totalRevenue, pendingPayments, totalEnrollments: enrollments,
      },
      recentPayments: (payments as any[]).slice(0, 10),
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// SERVE FRONTEND (production)
// ═══════════════════════════════════════════════════════════════════════════════
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('/{*splat}', (_req, res) => {
  const indexFile = path.join(distPath, 'index.html');
  res.sendFile(indexFile, (err) => {
    if (err) {
      res.status(500).send('Server starting up...');
    }
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
