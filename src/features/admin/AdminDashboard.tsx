import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePayments } from '../../context/PaymentContext';
import { useCourses } from '../../hooks/useCourses';
import { useVideos } from '../../hooks/useVideos';
import { useNotes } from '../../hooks/useNotes';
import { useQuizzes } from '../../hooks/useQuizzes';
import { useAnalytics } from '../../hooks/useAnalytics';
import { defaultCourses } from './defaultCourses';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Course {
  id: string;
  _id?: string;
  title: string;
  price: number;
  originalPrice: number;
  description: string;
  badge: string;
  badgeColor: string;
  lectures: number;
  hours: number;
  level: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  course: string;
  amount: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

// ─── YouTube ID extractor ─────────────────────────────────────────────────────
const getYouTubeId = (url: string): string | null => {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
};

const VIDEO_TYPES     = ['Full Lecture', 'Free Preview', 'Introduction', 'Short Clip', 'Practice Session', 'Live Recording'];
const VIDEO_CATEGORIES = ['NORCET11', 'Medical Surgical', 'Anatomy', 'Pharmacology', 'Nursing Fundamentals', 'Community Health', 'Paediatrics', 'Other'];

const DOC_TYPES = ['Study Notes', 'Previous Year Papers', 'Practice Questions', 'Syllabus Guide', 'Formula Sheet', 'Quick Revision', 'Case Studies', 'Other'];
const ACCEPTED_EXTENSIONS = '.pdf,.doc,.docx,.ppt,.pptx';

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const getDocIcon = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return { icon: '📄', color: '#ef4444', bg: '#fef2f2', label: 'PDF' };
  if (ext === 'doc' || ext === 'docx') return { icon: '📝', color: '#2563eb', bg: '#eff6ff', label: 'WORD' };
  if (ext === 'ppt' || ext === 'pptx') return { icon: '📊', color: '#f59e0b', bg: '#fffbeb', label: 'PPT' };
  return { icon: '📎', color: '#64748b', bg: '#f1f5f9', label: ext?.toUpperCase() ?? 'FILE' };
};

interface QuizQuestion {
  id: string;
  questionText: string;
  questionCode: string;
  topicType: string;
  options: string[];
  answer: number;
  explanation?: string;
}

const QUIZ_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
const emptyQ = (): QuizQuestion => ({ id: `q-${Date.now()}-${Math.random().toString(36).slice(2)}`, questionText: '', questionCode: '', topicType: '', options: ['', '', '', ''], answer: 0, explanation: '' });

// ─── Default Data (legacy - students will be migrated to DB) ──────────────────

const defaultStudents: Student[] = [
  { id: '1', name: 'Priya Sharma', email: 'priya@email.com', course: "ACHIEVERS'S PRIME: NORCET11", amount: 10000, date: '2026-03-20', status: 'approved' },
  { id: '2', name: 'Rahul Verma', email: 'rahul@email.com', course: 'ACHIEVERS HUB: NORCET 11', amount: 13000, date: '2026-03-25', status: 'pending' },
  { id: '3', name: 'Anjali Singh', email: 'anjali@email.com', course: 'MEDICAL SURGICAL NURSING', amount: 8000, date: '2026-03-27', status: 'pending' },
];

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Icons = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  courses:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  videos:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
  notes:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  assignments:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  students:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  payments:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  logout:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  hamburger: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
};

const NAV_ITEMS = [
  { label: 'Dashboard',   icon: Icons.dashboard },
  { label: 'Courses',     icon: Icons.courses },
  { label: 'Videos',      icon: Icons.videos },
  { label: 'Notes',       icon: Icons.notes },
  { label: 'Quizzes',     icon: Icons.assignments },
  { label: 'Students',    icon: Icons.students },
  { label: 'Payments',    icon: Icons.payments },
];

// ─── Component ────────────────────────────────────────────────────────────────
export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout: authLogout } = useAuth();
  const { payments, updatePaymentStatus } = usePayments();
  const [activeTab, setActiveTab]   = useState('Dashboard');
  const [previewScreenshot, setPreviewScreenshot] = useState<string | null>(null);
  const [isNavOpen, setIsNavOpen]   = useState(window.innerWidth > 768);
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const handleTabClick = (label: string) => {
    setActiveTab(label);
    if (isMobile) setIsNavOpen(false);
  };
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  // ── API hooks (MongoDB-backed) ──
  const { courses, addCourse, updateCourse, deleteCourse } = useCourses();
  const { videos, addVideo } = useVideos();
  const { notes, addNote } = useNotes();
  const { quizzes, addQuiz } = useQuizzes();
  const { analytics } = useAnalytics();

  // Legacy local state (kept for backward compat during migration)
  const [students,    setStudents]    = useState<Student[]>(defaultStudents);
  const [quizMode,  setQuizMode]  = useState<'manual' | 'json'>('manual');
  const [jsonError, setJsonError] = useState('');
  const [quizForm,  setQuizForm]  = useState<{ title: string; level: string; topic: string; course: string; questions: QuizQuestion[] }>({ title: '', level: 'Beginner', topic: '', course: '', questions: [emptyQ()] });

  // Modal visibility
  const [showCourseModal,     setShowCourseModal]     = useState(false);
  const [showVideoModal,      setShowVideoModal]      = useState(false);
  const [showNoteModal,       setShowNoteModal]       = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [editingCourse,       setEditingCourse]       = useState<Course | null>(null);
  const [selectedCourse,      setSelectedCourse]      = useState<Course | null>(null);

  // Forms
  const emptyCourse = { title: '', price: '', originalPrice: '', description: '', badge: 'NEW', badgeColor: '#2563eb', lectures: '', hours: '', level: 'All Levels' };
  const [courseForm,     setCourseForm]     = useState(emptyCourse);
  const [videoForm,      setVideoForm]      = useState({ title: '', course: '', url: '', description: '', category: '', videoType: 'Full Lecture' });
  const [noteForm,       setNoteForm]       = useState({ title: '', description: '', course: '', price: '', fileName: '', docType: 'Study Notes', fileSize: '', fileUrl: '' });

  // Computed - use API analytics when available, fallback to local calculation
  const totalRevenue = analytics?.overview?.totalRevenue
    ?? (payments.filter(p => p.status === 'approved').reduce((sum, p) => sum + p.total, 0)
    + students.filter(s => s.status === 'approved').reduce((sum, s) => sum + s.amount, 0));
  const pendingCount = analytics?.overview?.pendingPayments
    ?? (payments.filter(p => p.status === 'pending').length
    + students.filter(s => s.status === 'pending').length);
  const totalStudents = analytics?.overview?.totalStudents ?? students.length;

  // ── Handlers ──
  const handleSaveCourse = async () => {
    const data = { ...courseForm, price: +courseForm.price, originalPrice: +courseForm.originalPrice, lectures: +courseForm.lectures, hours: +courseForm.hours };
    try {
      if (editingCourse) {
        await updateCourse(editingCourse._id || editingCourse.id, data);
      } else {
        await addCourse(data);
      }
    } catch (err) { console.error('Failed to save course:', err); }
    setShowCourseModal(false); setEditingCourse(null); setCourseForm(emptyCourse);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({ title: course.title, price: String(course.price), originalPrice: String(course.originalPrice), description: course.description, badge: course.badge, badgeColor: course.badgeColor, lectures: String(course.lectures), hours: String(course.hours), level: course.level });
    setShowCourseModal(true);
  };

  const handleSaveVideo = async () => {
    if (!videoForm.title.trim() || !videoForm.url.trim()) return;
    try {
      await addVideo({ ...videoForm, youtubeUrl: videoForm.url, courseId: videoForm.course });
    } catch (err) { console.error('Failed to save video:', err); }
    setShowVideoModal(false);
    setVideoForm({ title: '', course: '', url: '', description: '', category: '', videoType: 'Full Lecture' });
  };

  const handleSaveNote = async () => {
    if (!noteForm.title.trim() || !noteForm.fileName.trim()) return;
    try {
      await addNote({ ...noteForm, price: +noteForm.price, courseId: noteForm.course });
    } catch (err) { console.error('Failed to save note:', err); }
    setShowNoteModal(false);
    setNoteForm({ title: '', description: '', course: '', price: '', fileName: '', docType: 'Study Notes', fileSize: '', fileUrl: '' });
  };

  const resetQuizForm = (course = '') => {
    setQuizForm({ title: '', level: 'Beginner', topic: '', course, questions: [emptyQ()] });
    setQuizMode('manual');
    setJsonError('');
  };

  const addQuestion    = () => setQuizForm(f => ({ ...f, questions: [...f.questions, emptyQ()] }));
  const removeQuestion = (qi: number) => setQuizForm(f => ({ ...f, questions: f.questions.filter((_, i) => i !== qi) }));
  const updateQuestion = (qi: number, key: string, value: unknown) =>
    setQuizForm(f => ({ ...f, questions: f.questions.map((q, i) => i === qi ? { ...q, [key]: value } : q) }));
  const addOption      = (qi: number) =>
    setQuizForm(f => ({ ...f, questions: f.questions.map((q, i) => i === qi ? { ...q, options: [...q.options, ''] } : q) }));
  const removeOption   = (qi: number, oi: number) =>
    setQuizForm(f => ({ ...f, questions: f.questions.map((q, i) => i === qi ? { ...q, options: q.options.filter((_, j) => j !== oi), answer: q.answer === oi ? 0 : q.answer > oi ? q.answer - 1 : q.answer } : q) }));
  const updateOption   = (qi: number, oi: number, val: string) =>
    setQuizForm(f => ({ ...f, questions: f.questions.map((q, i) => i === qi ? { ...q, options: q.options.map((o, j) => j === oi ? val : o) } : q) }));

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        // Robustly support both array and object quiz formats
        let questionsRaw: any[] = [];
        let quizTitle = '';
        let quizLevel = '';
        if (Array.isArray(data)) {
          questionsRaw = data;
        } else if (typeof data === 'object' && data !== null && Array.isArray(data.questions)) {
          questionsRaw = data.questions;
          quizTitle = typeof data.title === 'string' ? data.title : '';
          quizLevel = typeof data.level === 'string' ? data.level : '';
        } else {
          throw new Error('Invalid quiz format: must be an array or object with questions array.');
        }
        if (!questionsRaw.length) throw new Error('No questions found in JSON.');
        // Normalize all questions
        const questions: QuizQuestion[] = questionsRaw.map((q: Record<string, unknown>, i: number) => ({
          id: `json-${i}`,
          questionText: typeof q.questionText === 'string' ? q.questionText : String(q.question || ''),
          questionCode: typeof q.questionCode === 'string' ? q.questionCode : '',
          topicType: typeof q.topicType === 'string' ? q.topicType : '',
          options: Array.isArray(q.options) ? q.options.map(String) : ['', '', '', ''],
          answer: typeof q.correct_index === 'number' ? q.correct_index : (typeof q.answer === 'number' ? q.answer : 0),
          explanation: typeof q.explanation === 'string' ? q.explanation : '',
        }));
        setQuizForm(f => ({
          ...f,
          title: quizTitle || f.title,
          level: quizLevel || f.level,
          questions
        }));
        setJsonError('');
      } catch (err: unknown) {
        setJsonError(err instanceof Error ? err.message : 'Invalid JSON format.');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveQuiz = async () => {
    const validQs = quizForm.questions.filter(q => q.questionText.trim());
    if (!quizForm.title.trim() || validQs.length === 0) return;
    try {
      await addQuiz({ ...quizForm, questions: validQs, courseId: quizForm.course });
    } catch (err) { console.error('Failed to save quiz:', err); }
    setShowAssignmentModal(false);
    resetQuizForm();
  };

  const handlePayment = (id: string, action: 'approved' | 'rejected') =>
    setStudents(students.map(s => s.id === id ? { ...s, status: action } : s));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>

      {/* Mobile backdrop */}
      <div className={`sidebar-backdrop ${isNavOpen && isMobile ? 'visible' : ''}`} onClick={() => setIsNavOpen(false)} />

      {/* ── SIDEBAR ── */}
      <aside className={`app-sidebar ${isNavOpen ? 'open' : ''}`} style={{ width: isNavOpen ? '260px' : '72px', transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)', background: 'linear-gradient(180deg, #0f172a 0%, #131f35 100%)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'sticky', top: 0, flexShrink: 0, boxShadow: '4px 0 32px rgba(0,0,0,0.2)', zIndex: 200 }}>

        {/* Logo */}
        <div style={{ padding: isNavOpen ? '26px 20px 22px' : '26px 0 22px', display: 'flex', alignItems: 'center', justifyContent: isNavOpen ? 'flex-start' : 'center', gap: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width: '42px', height: '42px', flexShrink: 0, background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(37,99,235,0.45)' }}>
            <span style={{ color: '#fff', fontWeight: '900', fontSize: '15px', letterSpacing: '-1px' }}>NA</span>
          </div>
          {isNavOpen && (
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#f1f5f9', letterSpacing: '0.4px', lineHeight: 1.2 }}>NURSING ACHIEVERS</div>
              <div style={{ fontSize: '10px', color: '#475569', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '3px' }}>Admin Panel</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ padding: '20px 10px', flex: 1 }}>
          {isNavOpen && (
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#334155', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '0 12px 12px' }}>
              NAVIGATION
            </div>
          )}
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              onClick={() => handleTabClick(item.label)}
              onMouseEnter={() => setHoveredNav(item.label)}
              onMouseLeave={() => setHoveredNav(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 12px', borderRadius: '10px', cursor: 'pointer',
                marginBottom: '2px', justifyContent: isNavOpen ? 'flex-start' : 'center',
                background: activeTab === item.label
                  ? 'linear-gradient(90deg, rgba(37,99,235,0.28) 0%, rgba(37,99,235,0.08) 100%)'
                  : hoveredNav === item.label ? 'rgba(255,255,255,0.05)' : 'transparent',
                color: activeTab === item.label ? '#60a5fa' : hoveredNav === item.label ? '#cbd5e1' : '#475569',
                fontWeight: activeTab === item.label ? '700' : '500',
                fontSize: '13.5px', transition: 'all 0.15s ease',
                borderLeft: activeTab === item.label ? '3px solid #3b82f6' : '3px solid transparent',
              }}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {isNavOpen && <span>{item.label}</span>}
              {isNavOpen && item.label === 'Payments' && pendingCount > 0 && (
                <span style={{ marginLeft: 'auto', backgroundColor: '#ef4444', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800' }}>
                  {pendingCount}
                </span>
              )}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: isNavOpen ? '16px 20px' : '16px 0', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: isNavOpen ? 'flex-start' : 'center' }}>
          <button
            onClick={() => { authLogout(); navigate('/'); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', color: '#f87171', fontWeight: '600', fontSize: '13px', padding: '8px 14px', borderRadius: '8px' }}
          >
            {Icons.logout}
            {isNavOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="app-main" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* ── STICKY GLASS HEADER ── */}
        <header className="app-header" style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(240,244,248,0.88)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(226,232,240,0.9)', padding: '0 40px', height: '64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, boxShadow: '0 1px 0 rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => setIsNavOpen(!isNavOpen)} style={toggleBtn}>{Icons.hamburger}</button>
            <div>
              <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.3px' }}>{activeTab}</h1>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(37,99,235,0.4)', boxShadow: '0 2px 10px rgba(37,99,235,0.3)' }}
              />
            ) : (
              <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(37,99,235,0.35)' }}>
                <span style={{ color: '#fff', fontWeight: '800', fontSize: '14px' }}>A</span>
              </div>
            )}
            {isNavOpen && (
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{user?.name ?? 'Admin'}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Super Admin</div>
              </div>
            )}
          </div>
        </header>
        <div className="content-area" style={{ padding: '32px 40px', flex: 1 }}>

        {/* ── DASHBOARD ── */}
        {activeTab === 'Dashboard' && (
          <div>
            <div className="admin-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              {[
                { label: 'Total Revenue',    value: `₹${totalRevenue.toLocaleString()}`, gradient: 'linear-gradient(135deg, #042f2e 0%, #059669 100%)', shadow: 'rgba(5,150,105,0.28)',  icon: '💰', note: 'From MongoDB' },
                { label: 'Total Students',   value: totalStudents,                       gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)', shadow: 'rgba(37,99,235,0.28)',  icon: '👥', note: 'Enrolled students' },
                { label: 'Pending Payments', value: pendingCount,                        gradient: 'linear-gradient(135deg, #7f1d1d 0%, #ef4444 100%)', shadow: 'rgba(239,68,68,0.28)',  icon: '⏳', note: 'Needs your action' },
                { label: 'Total Courses',    value: courses.length,                      gradient: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)', shadow: 'rgba(124,58,237,0.28)', icon: '📚', note: 'Active courses' },
              ].map((s) => (
                <div key={s.label} style={{ background: s.gradient, borderRadius: '16px', padding: '24px', boxShadow: `0 10px 28px ${s.shadow}`, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
                  <div style={{ fontSize: '26px', marginBottom: '10px' }}>{s.icon}</div>
                  <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: '600', letterSpacing: '0.3px' }}>{s.label}</p>
                  <p style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: '900', color: '#fff', letterSpacing: '-0.5px' }}>{s.value}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>{s.note}</p>
                </div>
              ))}
            </div>

            <div style={tableCardStyle}>
              <h3 style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>Recent Enrollments</h3>
              <Table headers={['Student', 'Course', 'Amount', 'Date', 'Status']}>
                {students.map((s) => (
                  <tr key={s.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={td}><div style={{ fontWeight: '600', color: '#1e293b' }}>{s.name}</div><div style={{ fontSize: '12px', color: '#94a3b8' }}>{s.email}</div></td>
                    <td style={{ ...td, fontSize: '12px', color: '#64748b' }}>{s.course}</td>
                    <td style={td}>₹{s.amount.toLocaleString()}</td>
                    <td style={{ ...td, color: '#94a3b8', fontSize: '12px' }}>{s.date}</td>
                    <td style={td}><StatusBadge status={s.status} /></td>
                  </tr>
                ))}
              </Table>
            </div>
          </div>
        )}

        {/* ── COURSES ── */}
        {activeTab === 'Courses' && (
          <div>
            {!selectedCourse ? (
              /* ── COURSE GRID ── */
              <div>
                <button onClick={() => { setEditingCourse(null); setCourseForm(emptyCourse); setShowCourseModal(true); }} style={addBtn}>+ Add Course</button>
                <div style={gridStyle}>
                  {(courses.length > 0 ? courses : defaultCourses).map((c, idx) => {
                    const isDemo = !c._id && !c.id;
                    return (
                      <div key={c._id || c.id || idx} style={{ ...cardStyle, cursor: 'pointer' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <span style={{ backgroundColor: c.badgeColor + '20', color: c.badgeColor, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>{c.badge}</span>
                          {!isDemo && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={(e) => { e.stopPropagation(); handleEditCourse(c); }} style={editBtn}>Edit</button>
                              <button onClick={async (e) => { e.stopPropagation(); try { await deleteCourse(c._id || c.id); } catch(err) { console.error(err); } }} style={deleteBtn}>Delete</button>
                            </div>
                          )}
                        </div>
                        <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{c.title}</h4>
                        <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#64748b' }}>{c.description}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                          <span style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>₹{c.price.toLocaleString()}</span>
                          {c.price < c.originalPrice && <span style={{ fontSize: '12px', color: '#94a3b8', textDecoration: 'line-through' }}>₹{c.originalPrice.toLocaleString()}</span>}
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px' }}>{c.lectures} lectures · {c.hours}h · {c.level}</div>
                        <button
                          onClick={() => setSelectedCourse(c)}
                          style={{ width: '100%', padding: '9px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                        >
                          View Curriculum →
                        </button>
                        {isDemo && <div style={{marginTop:8, fontSize:11, color:'#64748b'}}>Demo course (DB is empty)</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* ── UDEMY-STYLE COURSE DETAIL VIEW ── */
              <div>
                {/* Back Button */}
                <button
                  onClick={() => setSelectedCourse(null)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontWeight: '600', fontSize: '14px', marginBottom: '24px', padding: 0 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                  Back to Courses
                </button>

                {/* Course Header */}
                <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', borderRadius: '16px', padding: '32px', marginBottom: '28px', color: '#fff' }}>
                  <span style={{ backgroundColor: selectedCourse.badgeColor, color: '#fff', fontSize: '11px', fontWeight: '800', padding: '4px 12px', borderRadius: '4px', letterSpacing: '0.8px', marginBottom: '16px', display: 'inline-block' }}>
                    {selectedCourse.badge}
                  </span>
                  <h1 style={{ fontSize: '26px', fontWeight: '900', margin: '12px 0 8px', color: '#fff' }}>{selectedCourse.title}</h1>
                  <p style={{ margin: '0 0 20px', color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>{selectedCourse.description}</p>
                  <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>
                    <span>📚 {selectedCourse.lectures} Lectures</span>
                    <span>⏱ {selectedCourse.hours} Hours</span>
                    <span>🎯 {selectedCourse.level}</span>
                    <span>💰 ₹{selectedCourse.price.toLocaleString()}</span>
                  </div>
                </div>

                {/* Curriculum */}
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: '0 0 20px' }}>Course Curriculum</h2>

                {/* Video Lectures Module */}
                <div style={curriculumSection}>
                  <div style={curriculumHeader('#eff6ff', '#2563eb')}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="5" width="15" height="14" rx="2"/><polygon points="23 7 16 12 23 17 23 7"/></svg>
                    <span>🎥 Video Lectures ({selectedCourse.hours}+ Hours)</span>
                  </div>
                  {videos.filter(v => v.courseId === (selectedCourse._id || selectedCourse.id)).length === 0 ? (
                    <div style={curriculumEmpty}>
                      No videos added yet.
                      <button onClick={() => { setShowVideoModal(true); setVideoForm({ title: '', course: selectedCourse._id || selectedCourse.id, url: '', description: '', category: '', videoType: 'Full Lecture' }); }} style={inlineAddBtn}>+ Add Video</button>
                    </div>
                  ) : (
                    videos.filter(v => v.courseId === (selectedCourse._id || selectedCourse.id)).map((v) => (
                      <div key={v.id} style={lessonRow}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        <span style={{ flex: 1, fontSize: '14px', color: '#1e293b' }}>{v.title}</span>
                        <span style={tagStyle('#eff6ff', '#2563eb')}>Video</span>
                      </div>
                    ))
                  )}
                  <button onClick={() => { setShowVideoModal(true); setVideoForm({ title: '', course: selectedCourse._id || selectedCourse.id, url: '', description: '', category: '', videoType: 'Full Lecture' }); }} style={curriculumAddBtn}>+ Add Video Lecture</button>
                </div>

                {/* E-Notes Module */}
                <div style={curriculumSection}>
                  <div style={curriculumHeader('#f5f3ff', '#7c3aed')}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <span>📝 Premium E-Notes (PDF)</span>
                  </div>
                  {notes.filter(n => n.courseId === (selectedCourse._id || selectedCourse.id)).length === 0 ? (
                    <div style={curriculumEmpty}>
                      No notes added yet.
                      <button onClick={() => { setShowNoteModal(true); setNoteForm({ title: '', description: '', course: selectedCourse._id || selectedCourse.id, price: '', fileName: '', docType: 'Study Notes', fileSize: '', fileUrl: '' }); }} style={inlineAddBtn}>+ Add Note</button>
                    </div>
                  ) : (
                    notes.filter(n => n.courseId === (selectedCourse._id || selectedCourse.id)).map((n) => (
                      <div key={n.id} style={lessonRow}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
                        <span style={{ flex: 1, fontSize: '14px', color: '#1e293b' }}>{n.title}</span>
                        <span style={{ fontSize: '12px', color: '#64748b', marginRight: '8px' }}>₹{n.price.toLocaleString()}</span>
                        <span style={tagStyle('#f5f3ff', '#7c3aed')}>PDF</span>
                      </div>
                    ))
                  )}
                  <button onClick={() => { setShowNoteModal(true); setNoteForm({ title: '', description: '', course: selectedCourse._id || selectedCourse.id, price: '', fileName: '', docType: 'Study Notes', fileSize: '', fileUrl: '' }); }} style={curriculumAddBtn}>+ Add E-Note</button>
                </div>

                {/* Daily Quiz Module */}
                <div style={curriculumSection}>
                  <div style={curriculumHeader('#f0fdf4', '#059669')}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                    <span>🧠 Daily Quiz &amp; Assignments</span>
                  </div>
                  {quizzes.filter(q => q.courseId === (selectedCourse._id || selectedCourse.id)).length === 0 ? (
                    <div style={curriculumEmpty}>
                      No quizzes added yet.
                      <button onClick={() => { resetQuizForm(selectedCourse._id || selectedCourse.id); setShowAssignmentModal(true); }} style={inlineAddBtn}>+ Add Quiz</button>
                    </div>
                  ) : (
                    quizzes.filter(q => q.courseId === (selectedCourse._id || selectedCourse.id)).map((q) => (
                      <div key={q.id} style={lessonRow}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/></svg>
                        <span style={{ flex: 1, fontSize: '14px', color: '#1e293b' }}>{q.title}</span>
                        <span style={{ fontSize: '11px', color: '#94a3b8', marginRight: '8px' }}>{q.questions.length} Questions</span>
                        <span style={tagStyle('#f0fdf4', '#059669')}>Quiz</span>
                      </div>
                    ))
                  )}
                  <button onClick={() => { resetQuizForm(selectedCourse._id || selectedCourse.id); setShowAssignmentModal(true); }} style={curriculumAddBtn}>+ Add Quiz</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── VIDEOS ── */}
        {activeTab === 'Videos' && (
          <div>
            <button onClick={() => setShowVideoModal(true)} style={addBtn}>+ Upload Video</button>
            <div style={gridStyle}>
              {videos.length === 0 && <EmptyState label="No videos uploaded yet" />}
              {videos.map((v) => {
                const ytId = getYouTubeId(v.youtubeUrl || v.url);
                return (
                  <div key={v._id || v.id} style={cardStyle}>
                    {/* Thumbnail */}
                    <div style={{ height: '145px', borderRadius: '10px', overflow: 'hidden', marginBottom: '14px', position: 'relative', background: '#0f172a' }}>
                      {ytId ? (
                        <img
                          src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                          alt={v.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1e3a5f,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        </div>
                      )}
                      {/* Play overlay */}
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '40px', height: '40px', background: 'rgba(0,0,0,0.55)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="0"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        </div>
                      </div>
                      {/* Type badge */}
                      {v.videoType && (
                        <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(37,99,235,0.85)', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '4px' }}>{v.videoType}</span>
                      )}
                    </div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '700', color: '#1e293b', lineHeight: 1.4 }}>{v.title}</h4>
                    {v.description && <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>{v.description}</p>}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {v.category && <span style={{ background: '#f5f3ff', color: '#7c3aed', fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '4px' }}>{v.category}</span>}
                      <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: '11px', fontWeight: '500', padding: '3px 8px', borderRadius: '4px' }}>{courses.find(c => (c._id || c.id) === v.courseId)?.title || ''}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── NOTES ── */}
        {activeTab === 'Notes' && (
          <div>
            <button onClick={() => setShowNoteModal(true)} style={addBtn}>+ Add Note</button>
            <div style={gridStyle}>
              {notes.length === 0 && <EmptyState label="No notes added yet" />}
              {notes.map((n) => {
                const di = getDocIcon(n.fileName);
                return (
                  <div key={n._id || n.id} style={cardStyle}>
                    {/* Doc preview banner */}
                    <div style={{ height: '120px', borderRadius: '10px', background: di.bg, border: `1px solid ${di.color}22`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '14px', position: 'relative', overflow: 'hidden' }}>
                      <span style={{ fontSize: '42px', lineHeight: 1 }}>{di.icon}</span>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: di.color, letterSpacing: '1px' }}>{di.label}</span>
                      {n.fileUrl && (
                        <a href={n.fileUrl} target="_blank" rel="noreferrer" style={{ position: 'absolute', bottom: '8px', right: '10px', fontSize: '11px', color: di.color, fontWeight: '600', textDecoration: 'none', background: '#fff', padding: '2px 8px', borderRadius: '4px', border: `1px solid ${di.color}44` }}>Preview ↗</a>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1e293b', lineHeight: 1.4 }}>{n.title}</h4>
                      <span style={{ background: di.bg, color: di.color, fontSize: '10px', fontWeight: '700', padding: '3px 7px', borderRadius: '4px', flexShrink: 0 }}>{di.label}</span>
                    </div>
                    {n.description && <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>{n.description}</p>}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      {n.docType && <span style={{ background: '#f5f3ff', color: '#7c3aed', fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '4px' }}>{n.docType}</span>}
                      {n.fileSize && <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: '11px', padding: '3px 8px', borderRadius: '4px' }}>{n.fileSize}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '17px', fontWeight: '800', color: '#2563eb' }}>{n.price > 0 ? `₹${n.price.toLocaleString()}` : 'Free'}</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>{courses.find(c => (c._id || c.id) === n.courseId)?.title || ''}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── QUIZZES ── */}
        {activeTab === 'Quizzes' && (
          <div>
            <button onClick={() => { resetQuizForm(); setShowAssignmentModal(true); }} style={addBtn}>+ Create Quiz</button>
            <div style={gridStyle}>
              {quizzes.length === 0 && <EmptyState label="No quizzes created yet" />}
              {quizzes.map((quiz) => (
                <div key={quiz._id || quiz.id} style={cardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ background: '#f0fdf4', color: '#059669', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' }}>{quiz.level}</span>
                    <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '4px' }}>{quiz.questions.length} Qs</span>
                  </div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{quiz.title}</h4>
                  {quiz.topic && <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#64748b' }}>📌 {quiz.topic}</p>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                    <span>{courses.find(c => (c._id || c.id) === quiz.courseId)?.title || 'No course assigned'}</span>
                    <span>{quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString('en-IN') : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STUDENTS ── */}
        {activeTab === 'Students' && (
          <div style={tableCardStyle}>
            <Table headers={['Student', 'Email', 'Course', 'Amount', 'Date', 'Status']}>
              {students.map((s) => (
                <tr key={s.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={td}><span style={{ fontWeight: '600', color: '#1e293b' }}>{s.name}</span></td>
                  <td style={{ ...td, color: '#64748b' }}>{s.email}</td>
                  <td style={{ ...td, fontSize: '12px', color: '#64748b' }}>{s.course}</td>
                  <td style={td}>₹{s.amount.toLocaleString()}</td>
                  <td style={{ ...td, color: '#94a3b8', fontSize: '12px' }}>{s.date}</td>
                  <td style={td}><StatusBadge status={s.status} /></td>
                </tr>
              ))}
            </Table>
          </div>
        )}

        {/* ── PAYMENTS ── */}
        {activeTab === 'Payments' && (
          <>
            {/* Real payment requests with screenshots */}
            {payments.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: '0 0 14px' }}>Payment Proof Submissions</h3>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {payments.map(p => (
                    <div key={p._id || p.id} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                      <div className="payment-card-row" style={{ display: 'flex', gap: '16px', padding: '20px', flexWrap: 'wrap' }}>
                        {/* Screenshot thumbnail */}
                        <div
                          onClick={() => setPreviewScreenshot(p.screenshot)}
                          className="payment-screenshot"
                          style={{ width: '120px', height: '120px', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden', cursor: 'pointer', flexShrink: 0, position: 'relative', background: '#f8fafc' }}
                        >
                          <img src={p.screenshot} alt="Payment proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                               onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                               onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                            <span style={{ color: '#fff', fontSize: '12px', fontWeight: '700' }}>🔍 View</span>
                          </div>
                        </div>

                        {/* Payment info */}
                        <div style={{ flex: 1, minWidth: '200px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <span style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>{p.studentName}</span>
                            <StatusBadge status={p.status} />
                          </div>
                          <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#64748b' }}>{p.studentEmail}</p>
                          <div style={{ marginBottom: '8px' }}>
                            {p.courses.map(c => (
                              <div key={c.title} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569', padding: '2px 0' }}>
                                <span>{c.title}</span>
                                <span style={{ fontWeight: '600' }}>₹{c.price.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>₹{p.total.toLocaleString()}</span>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(p.submittedAt || p.createdAt || '').toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      {p.status === 'pending' && (
                        <div style={{ display: 'flex', borderTop: '1px solid #f1f5f9' }}>
                          <button
                            onClick={() => updatePaymentStatus(p._id || p.id || '', 'approved')}
                            style={{ flex: 1, padding: '12px', background: '#f0fdf4', color: '#059669', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'background 0.2s' }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                            Approve
                          </button>
                          <button
                            onClick={() => updatePaymentStatus(p._id || p.id || '', 'rejected')}
                            style={{ flex: 1, padding: '12px', background: '#fef2f2', color: '#ef4444', border: 'none', borderLeft: '1px solid #f1f5f9', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'background 0.2s' }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            Reject
                          </button>
                        </div>
                      )}
                      {p.status !== 'pending' && p.reviewedAt && (
                        <div style={{ padding: '10px 20px', borderTop: '1px solid #f1f5f9', fontSize: '11px', color: '#94a3b8' }}>
                          {p.status === 'approved' ? '✅' : '❌'} {p.status.charAt(0).toUpperCase() + p.status.slice(1)} on {new Date(p.reviewedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legacy sample data */}
            <div style={tableCardStyle}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: '0 0 14px', padding: '0 4px' }}>Payment Records</h3>
              <Table headers={['Student', 'Course', 'Amount', 'Date', 'Status', 'Action']}>
                {students.map((s) => (
                  <tr key={s.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={td}><div style={{ fontWeight: '600', color: '#1e293b' }}>{s.name}</div><div style={{ fontSize: '12px', color: '#94a3b8' }}>{s.email}</div></td>
                    <td style={{ ...td, fontSize: '12px', color: '#64748b' }}>{s.course}</td>
                    <td style={td}>₹{s.amount.toLocaleString()}</td>
                    <td style={{ ...td, color: '#94a3b8', fontSize: '12px' }}>{s.date}</td>
                    <td style={td}><StatusBadge status={s.status} /></td>
                    <td style={td}>
                      {s.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handlePayment(s.id, 'approved')}  style={{ padding: '6px 12px', background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Approve</button>
                          <button onClick={() => handlePayment(s.id, 'rejected')}  style={{ padding: '6px 12px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Reject</button>
                        </div>
                      ) : <span style={{ color: '#94a3b8', fontSize: '13px' }}>—</span>}
                    </td>
                  </tr>
                ))}
              </Table>
            </div>

            {payments.length === 0 && students.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>💳</div>
                <p style={{ color: '#94a3b8', fontSize: '15px', fontWeight: '600' }}>No payment requests yet</p>
                <p style={{ color: '#cbd5e1', fontSize: '13px' }}>Payment proofs from students will appear here</p>
              </div>
            )}
          </>
        )}
        </div>
      </main>

      {/* ── COURSE MODAL ── */}
      {showCourseModal && (
        <Modal onClose={() => { setShowCourseModal(false); setEditingCourse(null); }} title={editingCourse ? 'Edit Course' : 'Add New Course'}>
          {[
            { label: 'Course Title',       key: 'title',         type: 'text' },
            { label: 'Price (₹)',          key: 'price',         type: 'number' },
            { label: 'Original Price (₹)', key: 'originalPrice', type: 'number' },
            { label: 'Total Lectures',     key: 'lectures',      type: 'number' },
            { label: 'Total Hours',        key: 'hours',         type: 'number' },
          ].map(f => (
            <Field key={f.key} label={f.label}>
              <input type={f.type} value={(courseForm as any)[f.key]} onChange={e => setCourseForm({ ...courseForm, [f.key]: e.target.value })} style={inputStyle} />
            </Field>
          ))}
          <Field label="Description">
            <textarea value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} style={{ ...inputStyle, height: '80px', resize: 'vertical' }} />
          </Field>
          <Field label="Level">
            <select value={courseForm.level} onChange={e => setCourseForm({ ...courseForm, level: e.target.value })} style={inputStyle}>
              {['All Levels', 'Beginner', 'Intermediate', 'Advanced'].map(l => <option key={l}>{l}</option>)}
            </select>
          </Field>
          <Field label="Badge Text">
            <input value={courseForm.badge} onChange={e => setCourseForm({ ...courseForm, badge: e.target.value })} style={inputStyle} />
          </Field>
          <ModalActions onSave={handleSaveCourse} onCancel={() => { setShowCourseModal(false); setEditingCourse(null); }} />
        </Modal>
      )}

      {/* ── VIDEO MODAL ── */}
      {showVideoModal && (
        <div style={overlayStyle} onClick={() => setShowVideoModal(false)}>
          <div style={{ ...modalStyle, maxWidth: '640px', width: '95%' }} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg,#1e3a5f,#2563eb)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>Upload Video</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Add a new video lecture to your course</p>
                </div>
              </div>
              <button onClick={() => setShowVideoModal(false)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#64748b', fontWeight: '400', lineHeight: 1 }}>×</button>
            </div>

            {/* 1. Video Title */}
            <Field label="1. Video Title *">
              <input
                placeholder="e.g. Introduction to NORCET Syllabus"
                value={videoForm.title}
                onChange={e => setVideoForm({ ...videoForm, title: e.target.value })}
                style={inputStyle}
              />
            </Field>

            {/* 2. YouTube Link */}
            <Field label="2. YouTube Video Link *">
              <input
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoForm.url}
                onChange={e => setVideoForm({ ...videoForm, url: e.target.value })}
                style={inputStyle}
              />
            </Field>

            {/* 6. Video Preview */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>6. Video Preview</label>
              {getYouTubeId(videoForm.url) ? (
                <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0', aspectRatio: '16/9', background: '#000' }}>
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${getYouTubeId(videoForm.url)}`}
                    title="Video Preview"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ display: 'block', width: '100%', minHeight: '220px' }}
                  />
                </div>
              ) : (
                <div style={{ borderRadius: '10px', border: '2px dashed #e2e8f0', background: '#f8fafc', minHeight: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#94a3b8' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="5" width="15" height="14" rx="2"/><polygon points="23 7 16 12 23 17 23 7"/></svg>
                  <span style={{ fontSize: '13px', fontWeight: '500' }}>Paste a YouTube link above to see preview</span>
                </div>
              )}
            </div>

            {/* 3. Description */}
            <Field label="3. Description">
              <textarea
                placeholder="Brief description of what this video covers…"
                value={videoForm.description}
                onChange={e => setVideoForm({ ...videoForm, description: e.target.value })}
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
              />
            </Field>

            {/* 4 & 5. Category + Type in a row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={labelStyle}>4. Category</label>
                <select value={videoForm.category} onChange={e => setVideoForm({ ...videoForm, category: e.target.value })} style={inputStyle}>
                  <option value="">Select Category</option>
                  {VIDEO_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>5. Type of Video</label>
                <select value={videoForm.videoType} onChange={e => setVideoForm({ ...videoForm, videoType: e.target.value })} style={inputStyle}>
                  {VIDEO_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Course */}
            <Field label="Course">
              <select value={videoForm.course} onChange={e => setVideoForm({ ...videoForm, course: e.target.value })} style={inputStyle}>
                <option value="">Select Course</option>
                {courses.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.title}</option>)}
              </select>
            </Field>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                onClick={() => setShowVideoModal(false)}
                style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
              >Cancel</button>
              <button
                onClick={handleSaveVideo}
                disabled={!videoForm.title.trim() || !videoForm.url.trim()}
                style={{ flex: 2, padding: '12px', background: videoForm.title.trim() && videoForm.url.trim() ? 'linear-gradient(135deg,#1e3a5f,#2563eb)' : '#cbd5e1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: videoForm.title.trim() && videoForm.url.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                Upload Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NOTE MODAL ── */}
      {showNoteModal && (
        <div style={overlayStyle} onClick={() => setShowNoteModal(false)}>
          <div style={{ ...modalStyle, maxWidth: '620px', width: '95%' }} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>Add E-Note</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Upload study material for your students</p>
                </div>
              </div>
              <button onClick={() => setShowNoteModal(false)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', borderRadius: '8px', width: '32px', height: '32px', fontSize: '18px', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>

            {/* 1. Document Title */}
            <Field label="1. Document Title *">
              <input
                placeholder="e.g. NORCET 11 Complete Notes Chapter 1"
                value={noteForm.title}
                onChange={e => setNoteForm({ ...noteForm, title: e.target.value })}
                style={inputStyle}
              />
            </Field>

            {/* 2. Description */}
            <Field label="2. Document Description">
              <textarea
                placeholder="What topics does this document cover?"
                value={noteForm.description}
                onChange={e => setNoteForm({ ...noteForm, description: e.target.value })}
                style={{ ...inputStyle, minHeight: '72px', resize: 'vertical' }}
              />
            </Field>

            {/* 3. File Upload */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>3. Upload Document (PDF, DOCX, DOC, PPT) *</label>
              <label
                htmlFor="noteFileInput"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '10px', padding: '24px 16px',
                  border: noteForm.fileName ? '2px solid #7c3aed' : '2px dashed #cbd5e1',
                  borderRadius: '10px', background: noteForm.fileName ? '#faf5ff' : '#f8fafc',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {noteForm.fileName ? (
                  <>
                    <span style={{ fontSize: '36px' }}>{getDocIcon(noteForm.fileName).icon}</span>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{noteForm.fileName}</div>
                      {noteForm.fileSize && <div style={{ fontSize: '12px', color: '#7c3aed' }}>{noteForm.fileSize}</div>}
                    </div>
                    <span style={{ fontSize: '12px', color: '#7c3aed', fontWeight: '600' }}>Click to change file</span>
                  </>
                ) : (
                  <>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Click to upload or drag &amp; drop</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>PDF, DOC, DOCX, PPT, PPTX (Max 50MB)</div>
                    </div>
                  </>
                )}
              </label>
              <input
                id="noteFileInput"
                type="file"
                accept={ACCEPTED_EXTENSIONS}
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = URL.createObjectURL(file);
                  setNoteForm({ ...noteForm, fileName: file.name, fileSize: formatFileSize(file.size), fileUrl: url });
                }}
              />
            </div>

            {/* 5. Document Preview */}
            {noteForm.fileUrl && noteForm.fileName.toLowerCase().endsWith('.pdf') && (
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>5. Document Preview</label>
                <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0', height: '260px' }}>
                  <iframe
                    src={noteForm.fileUrl}
                    title="Document Preview"
                    width="100%"
                    height="100%"
                    style={{ display: 'block', border: 'none' }}
                  />
                </div>
              </div>
            )}
            {noteForm.fileUrl && !noteForm.fileName.toLowerCase().endsWith('.pdf') && (
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>5. Document Preview</label>
                <div style={{ borderRadius: '10px', border: '1px solid #e2e8f0', background: getDocIcon(noteForm.fileName).bg, padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '48px' }}>{getDocIcon(noteForm.fileName).icon}</span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{noteForm.fileName}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{noteForm.fileSize}</div>
                    <div style={{ fontSize: '12px', color: '#7c3aed', marginTop: '4px', fontWeight: '600' }}>✓ Ready to upload</div>
                  </div>
                </div>
              </div>
            )}

            {/* 4 & Doc Type in a row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={labelStyle}>4. Price (₹) — 0 for Free</label>
                <input
                  type="number"
                  placeholder="e.g. 199"
                  value={noteForm.price}
                  onChange={e => setNoteForm({ ...noteForm, price: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>5. Document Type</label>
                <select value={noteForm.docType} onChange={e => setNoteForm({ ...noteForm, docType: e.target.value })} style={inputStyle}>
                  {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Course */}
            <Field label="Course">
              <select value={noteForm.course} onChange={e => setNoteForm({ ...noteForm, course: e.target.value })} style={inputStyle}>
                <option value="">Select Course</option>
                {courses.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.title}</option>)}
              </select>
            </Field>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                onClick={() => setShowNoteModal(false)}
                style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
              >Cancel</button>
              <button
                onClick={handleSaveNote}
                disabled={!noteForm.title.trim() || !noteForm.fileName.trim()}
                style={{ flex: 2, padding: '12px', background: noteForm.title.trim() && noteForm.fileName.trim() ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : '#cbd5e1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: noteForm.title.trim() && noteForm.fileName.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Upload Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── QUIZ MODAL ── */}
      {showAssignmentModal && (
        <div style={overlayStyle} onClick={() => setShowAssignmentModal(false)}>
          <div style={{ ...modalStyle, maxWidth: '780px', width: '97%' }} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg,#059669,#10b981)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>Create Quiz</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Build a quiz manually or import from JSON</p>
                </div>
              </div>
              <button onClick={() => setShowAssignmentModal(false)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', borderRadius: '8px', width: '32px', height: '32px', fontSize: '18px', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>

            {/* Mode Tabs */}
            <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', borderRadius: '10px', padding: '4px', marginBottom: '22px' }}>
              {(['manual', 'json'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => { setQuizMode(mode); setJsonError(''); }}
                  style={{ flex: 1, padding: '9px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '13px', background: quizMode === mode ? '#fff' : 'transparent', color: quizMode === mode ? '#059669' : '#64748b', boxShadow: quizMode === mode ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s' }}
                >
                  {mode === 'manual' ? '✏️  Manual Entry' : '📂  Upload JSON'}
                </button>
              ))}
            </div>

            {/* ── MANUAL ENTRY ── */}
            {quizMode === 'manual' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={labelStyle}>Quiz Title *</label>
                    <input placeholder="e.g. NORCET 11 — Chapter 1 Quiz" value={quizForm.title} onChange={e => setQuizForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Quiz Level</label>
                    <select value={quizForm.level} onChange={e => setQuizForm(f => ({ ...f, level: e.target.value }))} style={inputStyle}>
                      {QUIZ_LEVELS.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                  <div>
                    <label style={labelStyle}>Quiz Topic</label>
                    <input placeholder="e.g. Pharmacology" value={quizForm.topic} onChange={e => setQuizForm(f => ({ ...f, topic: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Course</label>
                    <select value={quizForm.course} onChange={e => setQuizForm(f => ({ ...f, course: e.target.value }))} style={inputStyle}>
                      <option value="">Select Course</option>
                      {courses.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.title}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>Questions&nbsp;<span style={{ color: '#059669' }}>({quizForm.questions.length})</span></span>
                </div>

                {quizForm.questions.map((q, qi) => (
                  <div key={q.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', marginBottom: '14px', background: '#fafafa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#059669', background: '#f0fdf4', padding: '4px 12px', borderRadius: '20px' }}>Q{qi + 1}</span>
                      {quizForm.questions.length > 1 && (
                        <button onClick={() => removeQuestion(qi)} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', borderRadius: '6px', fontSize: '12px', fontWeight: '600', padding: '4px 10px', cursor: 'pointer' }}>✕ Remove</button>
                      )}
                    </div>
                        {/* (vi) Explanation (optional) */}
                        <div style={{ marginBottom: '10px' }}>
                          <label style={labelStyle}>Explanation <span style={{ color: '#94a3b8', fontWeight: '400' }}>(optional, shown after answer)</span></label>
                          <textarea
                            placeholder="Enter explanation for this question (optional)"
                            value={q.explanation || ''}
                            onChange={e => updateQuestion(qi, 'explanation', e.target.value)}
                            style={{ ...inputStyle, minHeight: '48px', resize: 'vertical' }}
                          />
                        </div>

                    {/* (ii) Question Text */}
                    <div style={{ marginBottom: '10px' }}>
                      <label style={labelStyle}>Question Text *</label>
                      <textarea placeholder="Enter the question…" value={q.questionText} onChange={e => updateQuestion(qi, 'questionText', e.target.value)} style={{ ...inputStyle, minHeight: '64px', resize: 'vertical' }} />
                    </div>

                    {/* (iii) Code Snippet (optional) */}
                    <div style={{ marginBottom: '10px' }}>
                      <label style={labelStyle}>Code Snippet <span style={{ color: '#94a3b8', fontWeight: '400' }}>(optional)</span></label>
                      <textarea placeholder="function example() {\n  // paste code here\n}" value={q.questionCode} onChange={e => updateQuestion(qi, 'questionCode', e.target.value)} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical', fontFamily: 'monospace', fontSize: '12px', background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155' }} />
                    </div>

                    {/* (iv) Topic Type (optional) */}
                    <div style={{ marginBottom: '14px' }}>
                      <label style={labelStyle}>Topic Type <span style={{ color: '#94a3b8', fontWeight: '400' }}>(optional)</span></label>
                      <input placeholder="e.g. Pharmacology, Anatomy, Physiology" value={q.topicType} onChange={e => updateQuestion(qi, 'topicType', e.target.value)} style={inputStyle} />
                    </div>

                    {/* (v) Options */}
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ ...labelStyle, marginBottom: '10px' }}>Options — <span style={{ color: '#94a3b8', fontWeight: '400', fontSize: '12px' }}>click ● to mark correct answer</span></label>
                      {q.options.map((opt, oi) => (
                        <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <button
                            onClick={() => updateQuestion(qi, 'answer', oi)}
                            title="Mark as correct"
                            style={{ width: '22px', height: '22px', borderRadius: '50%', border: `2px solid ${q.answer === oi ? '#059669' : '#cbd5e1'}`, background: q.answer === oi ? '#059669' : '#fff', flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                          >
                            {q.answer === oi && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />}
                          </button>
                          <input
                            value={opt}
                            placeholder={`Option ${oi + 1}`}
                            onChange={e => updateOption(qi, oi, e.target.value)}
                            style={{ ...inputStyle, flex: 1, background: q.answer === oi ? '#f0fdf4' : '#f8fafc', border: `1px solid ${q.answer === oi ? '#86efac' : '#e2e8f0'}` }}
                          />
                          {q.options.length > 2 && (
                            <button onClick={() => removeOption(qi, oi)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '18px', fontWeight: '700', padding: '0 4px', flexShrink: 0 }}>×</button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* (vi) Add Option */}
                    {q.options.length < 6 && (
                      <button onClick={() => addOption(qi)} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#059669', borderRadius: '6px', padding: '6px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>+ Add Option</button>
                    )}
                  </div>
                ))}

                {/* (vii) Add Question */}
                <button
                  onClick={addQuestion}
                  style={{ width: '100%', padding: '12px', background: '#f0fdf4', border: '2px dashed #86efac', borderRadius: '10px', color: '#059669', fontWeight: '700', fontSize: '14px', cursor: 'pointer', marginBottom: '4px' }}
                >+ Add Question</button>
              </div>
            )}

            {/* ── JSON UPLOAD ── */}
            {quizMode === 'json' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Upload Quiz JSON File</label>
                  <label htmlFor="quizJsonInput" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '24px 16px', border: '2px dashed #cbd5e1', borderRadius: '10px', background: '#f8fafc', cursor: 'pointer' }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: '600', color: '#374151', fontSize: '13px' }}>Click to upload .json file</div>
                      <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>Only .json files accepted</div>
                    </div>
                  </label>
                  <input id="quizJsonInput" type="file" accept=".json" style={{ display: 'none' }} onChange={handleJsonUpload} />
                </div>

                <label style={labelStyle}>Expected JSON Structure</label>
                <div style={{ background: '#1e293b', borderRadius: '10px', padding: '16px', marginBottom: '16px', overflow: 'auto' }}>
                  <pre style={{ margin: 0, fontSize: '11.5px', color: '#e2e8f0', lineHeight: 1.7, fontFamily: 'monospace', whiteSpace: 'pre' }}>{`{
  "title": "Quiz Title",
  "level": "Beginner",
  "questions": [
    {
      "question": "What is normal blood pressure?",
      "questionCode": "// optional code snippet",
      "questionLanguage": "javascript",
      "options": [
        "120/80 mmHg",
        "140/90 mmHg",
        "100/60 mmHg",
        "160/100 mmHg"
      ],
      "answer": 0
    }
  ]
}`}</pre>
                </div>

                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px 16px', marginBottom: '12px' }}>
                  <div style={{ fontWeight: '700', color: '#d97706', fontSize: '13px', marginBottom: '8px' }}>📌 Notes:</div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#92400e', lineHeight: 2 }}>
                    <li>Only <code style={{ background: '#fef9c3', padding: '1px 5px', borderRadius: '3px' }}>questionCode</code> is supported for code snippets (not in options).</li>
                    <li><code style={{ background: '#fef9c3', padding: '1px 5px', borderRadius: '3px' }}>options</code> must be an array of strings.</li>
                    <li><code style={{ background: '#fef9c3', padding: '1px 5px', borderRadius: '3px' }}>answer</code> is the index (0-based) of the correct option.</li>
                  </ul>
                </div>

                {jsonError && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#ef4444', fontWeight: '600' }}>⚠ {jsonError}</div>
                )}
                {!jsonError && quizForm.questions.some(q => q.questionText) && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#059669', fontWeight: '600' }}>
                    ✓ Loaded "{quizForm.title}" — {quizForm.questions.length} question{quizForm.questions.length !== 1 ? 's' : ''} ready
                  </div>
                )}
              </div>
            )}

            {/* (viii) Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                onClick={() => { setShowAssignmentModal(false); resetQuizForm(); }}
                style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
              >Cancel</button>
              <button
                onClick={handleSaveQuiz}
                disabled={!quizForm.title.trim() || !quizForm.questions.some(q => q.questionText.trim())}
                style={{ flex: 2, padding: '12px', background: quizForm.title.trim() && quizForm.questions.some(q => q.questionText.trim()) ? 'linear-gradient(135deg,#059669,#10b981)' : '#cbd5e1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: quizForm.title.trim() && quizForm.questions.some(q => q.questionText.trim()) ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/></svg>
                Create Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SCREENSHOT PREVIEW MODAL ── */}
      {previewScreenshot && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          onClick={() => setPreviewScreenshot(null)}
        >
          <button
            onClick={() => setPreviewScreenshot(null)}
            style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', fontSize: '20px', fontWeight: '300' }}
          >×</button>
          <img
            src={previewScreenshot}
            alt="Payment Screenshot"
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', objectFit: 'contain' }}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

// ─── Reusable Sub-components ─────────────────────────────────────────────────
const Table = ({ headers, children }: { headers: string[]; children: React.ReactNode }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
    <thead>
      <tr style={{ backgroundColor: '#f8fafc' }}>
        {headers.map(h => <th key={h} style={th}>{h}</th>)}
      </tr>
    </thead>
    <tbody>{children}</tbody>
  </table>
);

const StatusBadge = ({ status }: { status: string }) => (
  <span style={{
    padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'capitalize',
    backgroundColor: status === 'approved' ? '#f0fdf4' : status === 'rejected' ? '#fef2f2' : '#fffbeb',
    color:           status === 'approved' ? '#059669' : status === 'rejected' ? '#ef4444' : '#d97706',
  }}>{status}</span>
);

const Modal = ({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) => (
  <div style={overlayStyle} onClick={onClose}>
    <div style={modalStyle} onClick={e => e.stopPropagation()}>
      <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>{title}</h3>
      {children}
    </div>
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '14px' }}>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

const ModalActions = ({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) => (
  <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
    <button onClick={onSave}   style={{ flex: 1, padding: '11px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Save</button>
    <button onClick={onCancel} style={{ flex: 1, padding: '11px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
  </div>
);

const EmptyState = ({ label }: { label: string }) => (
  <p style={{ color: '#94a3b8', fontSize: '14px', margin: '10px 0' }}>{label}</p>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const curriculumSection: React.CSSProperties = { backgroundColor: '#fff', border: '1px solid #e8edf2', borderRadius: '14px', overflow: 'hidden', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' };
const curriculumEmpty: React.CSSProperties   = { padding: '16px 20px', fontSize: '13px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '12px' };
const lessonRow: React.CSSProperties         = { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderTop: '1px solid #f1f5f9' };
const curriculumAddBtn: React.CSSProperties  = { display: 'block', width: '100%', padding: '12px', background: '#f8fafc', color: '#2563eb', border: 'none', borderTop: '1px solid #f1f5f9', fontWeight: '600', fontSize: '13px', cursor: 'pointer', textAlign: 'left' };
const inlineAddBtn: React.CSSProperties      = { padding: '4px 12px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' };
const curriculumHeader = (bg: string, color: string): React.CSSProperties => ({ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px', backgroundColor: bg, fontSize: '14px', fontWeight: '700', color });
const tagStyle = (bg: string, color: string): React.CSSProperties => ({ backgroundColor: bg, color, fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '4px' });
const toggleBtn: React.CSSProperties      = { background: '#fff', border: '1px solid #e2e8f0', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' };
const addBtn: React.CSSProperties         = { padding: '10px 22px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '13.5px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' };
const editBtn: React.CSSProperties        = { padding: '5px 12px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' };
const deleteBtn: React.CSSProperties      = { padding: '5px 12px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' };
const gridStyle: React.CSSProperties      = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' };
const cardStyle: React.CSSProperties      = { backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e8edf2', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' };
const tableCardStyle: React.CSSProperties = { backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e8edf2', overflow: 'hidden', padding: '28px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' };
const overlayStyle: React.CSSProperties   = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const modalStyle: React.CSSProperties     = { backgroundColor: '#fff', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '460px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' };
const inputStyle: React.CSSProperties     = { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#f8fafc' };
const labelStyle: React.CSSProperties     = { fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' };
const th: React.CSSProperties             = { textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', background: '#f8fafc' };
const td: React.CSSProperties             = { padding: '14px 16px', fontSize: '13px', fontWeight: '600', color: '#1e293b', verticalAlign: 'middle', borderBottom: '1px solid #f1f5f9' };