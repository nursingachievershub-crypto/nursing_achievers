import mongoose, { Schema } from 'mongoose';

// ─── User ─────────────────────────────────────────────────────────────────────
const UserSchema = new Schema({
  email:     { type: String, required: true, unique: true },
  name:      { type: String, required: true },
  avatar:    { type: String, default: '' },
  loginType: { type: String, enum: ['google', 'admin'], default: 'google' },
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', UserSchema);

// ─── Course ───────────────────────────────────────────────────────────────────
const CourseSchema = new Schema({
  title:         { type: String, required: true },
  price:         { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  description:   { type: String, default: '' },
  badge:         { type: String, default: 'NEW' },
  badgeColor:    { type: String, default: '#2563eb' },
  lectures:      { type: Number, default: 0 },
  hours:         { type: Number, default: 0 },
  level:         { type: String, default: 'All Levels' },
}, { timestamps: true });

export const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

// ─── Video ────────────────────────────────────────────────────────────────────
const VideoSchema = new Schema({
  title:       { type: String, required: true },
  courseId:    { type: String, required: true },
  youtubeUrl:  { type: String, required: true },
  description: { type: String, default: '' },
  category:    { type: String, default: '' },
  videoType:   { type: String, default: 'Full Lecture' },
}, { timestamps: true });

export const Video = mongoose.models.Video || mongoose.model('Video', VideoSchema);

// ─── Note ─────────────────────────────────────────────────────────────────────
const NoteSchema = new Schema({
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  courseId:    { type: String, required: true },
  price:       { type: Number, default: 0 },
  fileName:    { type: String, default: '' },
  fileSize:    { type: String, default: '' },
  fileUrl:     { type: String, default: '' },
  docType:     { type: String, default: 'Study Notes' },
}, { timestamps: true });

export const Note = mongoose.models.Note || mongoose.model('Note', NoteSchema);

// ─── Quiz ─────────────────────────────────────────────────────────────────────
const QuizQuestionSchema = new Schema({
  questionText: { type: String, required: true },
  questionCode: { type: String, default: '' },
  topicType:    { type: String, default: '' },
  options:      [{ type: String }],
  answer:       { type: Number, default: 0 },
}, { _id: false });

const QuizSchema = new Schema({
  title:     { type: String, required: true },
  courseId:  { type: String, required: true },
  level:     { type: String, default: 'Beginner' },
  topic:     { type: String, default: '' },
  questions: [QuizQuestionSchema],
}, { timestamps: true });

export const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', QuizSchema);

// ─── Quiz Result ──────────────────────────────────────────────────────────────
const QuizResultSchema = new Schema({
  quizId:      { type: String, required: true },
  userId:      { type: String, required: true },
  userEmail:   { type: String, required: true },
  score:       { type: Number, required: true },
  totalMarks:  { type: Number, required: true },
  answers:     [{ type: Number }],
}, { timestamps: true });

export const QuizResult = mongoose.models.QuizResult || mongoose.model('QuizResult', QuizResultSchema);

// ─── Payment ──────────────────────────────────────────────────────────────────
const PaymentSchema = new Schema({
  studentEmail: { type: String, required: true },
  studentName:  { type: String, required: true },
  courses:      [{ title: String, price: Number }],
  total:        { type: Number, required: true },
  screenshot:   { type: String, default: '' },
  status:       { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewedAt:   { type: Date },
}, { timestamps: true });

export const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);

// ─── Enrollment ───────────────────────────────────────────────────────────────
const EnrollmentSchema = new Schema({
  userId:    { type: String, required: true },
  userEmail: { type: String, required: true },
  courseId:  { type: String, required: true },
}, { timestamps: true });

export const Enrollment = mongoose.models.Enrollment || mongoose.model('Enrollment', EnrollmentSchema);
