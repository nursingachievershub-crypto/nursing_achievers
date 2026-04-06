import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../_lib/mongodb';
import { Quiz, QuizResult } from '../_lib/models';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectDB();

    // POST with ?action=submit → submit quiz answers
    if (req.method === 'POST' && req.query.action === 'submit') {
      const { quizId, userId, userEmail, answers } = req.body;
      const quiz = await Quiz.findById(quizId);
      if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

      let score = 0;
      quiz.questions.forEach((q: any, i: number) => {
        if (answers[i] === q.answer) score++;
      });

      const result = await QuizResult.create({
        quizId, userId, userEmail, score,
        totalMarks: quiz.questions.length,
        answers,
      });
      return res.status(201).json(result);
    }

    // POST → create quiz
    if (req.method === 'POST') {
      const quiz = await Quiz.create(req.body);
      return res.status(201).json(quiz);
    }

    // GET → list quizzes
    if (req.method === 'GET') {
      const { courseId } = req.query;
      const filter = courseId ? { courseId } : {};
      const quizzes = await Quiz.find(filter).sort({ createdAt: -1 });
      return res.status(200).json(quizzes);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Quizzes error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
