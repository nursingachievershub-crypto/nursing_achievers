import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePayments } from '../../context/PaymentContext';
import { useQuizzes } from '../../hooks/useQuizzes';
import { useVideos } from '../../hooks/useVideos';
import { useNotes } from '../../hooks/useNotes';
import { coursesAPI } from '../../api/client';

type NursingAchieversPortalProps = {
  cartCount: number;
  onEnroll: (data: { title: string; price: number }) => void;
  onOpenCart: () => void;
};

const defaultCourses = [
  {
    title: "ACHIEVERS'S PRIME: NORCET11",
    price: 10000,
    originalPrice: 13000,
    rating: 4.8,
    reviews: 1240,
    lectures: 42,
    hours: 18,
    level: 'All Levels',
    badge: 'BESTSELLER',
    badgeColor: '#f59e0b',
    description: 'Complete NORCET11 preparation with mock tests, notes & live sessions.',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 55%, #2563eb 100%)',
    accentColor: '#93c5fd',
  },
  {
    title: 'ACHIEVERS HUB: NORCET 11',
    price: 13000,
    originalPrice: 13000,
    rating: 4.7,
    reviews: 890,
    lectures: 36,
    hours: 14,
    level: 'Beginner',
    badge: 'HOT & NEW',
    badgeColor: '#ef4444',
    description: 'Master nursing fundamentals with detailed video lectures and study material.',
    gradient: 'linear-gradient(135deg, #1a0533 0%, #4c1d95 55%, #7c3aed 100%)',
    accentColor: '#c4b5fd',
  },
  {
    title: 'MEDICAL SURGICAL NURSING',
    price: 8000,
    originalPrice: 11000,
    rating: 4.6,
    reviews: 670,
    lectures: 28,
    hours: 12,
    level: 'Intermediate',
    badge: 'TOP RATED',
    badgeColor: '#059669',
    description: 'In-depth coverage of medical surgical nursing concepts for competitive exams.',
    gradient: 'linear-gradient(135deg, #042f2e 0%, #065f46 55%, #059669 100%)',
    accentColor: '#6ee7b7',
  },
];

const FEATURE_CARDS = [
  {
    icon: '🎥',
    title: 'Video Lectures',
    desc: '120+ HD video lectures with expert explanations and visual aids',
    gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
    shadow: 'rgba(37,99,235,0.35)',
  },
  {
    icon: '📚',
    title: 'Premium E-Notes',
    desc: 'Comprehensive PDFs, previous year papers & quick revision sheets',
    gradient: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)',
    shadow: 'rgba(124,58,237,0.35)',
  },
  {
    icon: '🧠',
    title: 'Daily Quizzes',
    desc: 'Test your knowledge with 500+ curated MCQs and full mock tests',
    gradient: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
    shadow: 'rgba(5,150,105,0.35)',
  },
];

const STATS = [
  { value: '5,000+', label: 'Students Enrolled' },
  { value: '120+',   label: 'HD Video Lectures' },
  { value: '500+',   label: 'Practice MCQs' },
  { value: '98%',    label: 'Success Rate' },
];

const StarRating = ({ rating }: { rating: number }) => (
  <span style={{ color: '#fbbf24', fontSize: '13px', letterSpacing: '1px' }}>
    {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
  </span>
);

const NAV_ITEMS = [
  {
    label: 'Courses',
    icon: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>),
  },
  {
    label: 'Video Lectures',
    icon: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>),
  },
  {
    label: 'Study Notes',
    icon: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>),
  },
  {
    label: 'Mock Tests',
    icon: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>),
  },
  {
    label: 'My Progress',
    icon: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>),
  },
];

export const NursingAchieversPortal = ({ cartCount, onEnroll, onOpenCart }: NursingAchieversPortalProps) => {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();
  const [isNavOpen, setIsNavOpen]     = useState(window.innerWidth > 768);
  const [activeNav, setActiveNav]     = useState('Courses');
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [hoveredNav, setHoveredNav]   = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 768);
  const [courses, setCourses] = useState<any[]>(defaultCourses);
  
  const { payments } = usePayments();
  const { quizzes } = useQuizzes();
  const { videos } = useVideos();
  const { notes } = useNotes();
  
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Handle window resize for mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter courses by search query
  const filteredCourses = courses.filter(c =>
    !searchQuery.trim() ||
    c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch courses from MongoDB API (fallback to defaults)
  useEffect(() => {
    coursesAPI.getAll().then((data: any[]) => {
      if (data && data.length > 0) {
        const GRADIENTS = [
          { gradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 55%, #2563eb 100%)', accentColor: '#93c5fd' },
          { gradient: 'linear-gradient(135deg, #1a0533 0%, #4c1d95 55%, #7c3aed 100%)', accentColor: '#c4b5fd' },
          { gradient: 'linear-gradient(135deg, #042f2e 0%, #065f46 55%, #059669 100%)', accentColor: '#6ee7b7' },
        ];
        setCourses(data.map((c: any, i: number) => ({
          ...c,
          gradient: c.gradient || GRADIENTS[i % GRADIENTS.length].gradient,
          accentColor: c.accentColor || GRADIENTS[i % GRADIENTS.length].accentColor,
          rating: Number((c.rating || 4.5 + Math.random() * 0.4).toFixed(1)),
          reviews: c.reviews || Math.floor(500 + Math.random() * 1000),
        })));
      }
    }).catch((error) => {
      console.error("Failed to load courses:", error);
    });
  }, []);

  const handleSignOut = () => { logout(); navigate('/'); };
  const handleNavClick = (label: string) => {
    setActiveNav(label);
    if (isMobile) setIsNavOpen(false);
  };

  // Verify if student has an approved payment for any courses
  const approvedCourseTitles = new Set(
    payments
      .filter((p: any) => p.studentEmail?.toLowerCase() === user?.email?.toLowerCase() && p.status === 'approved')
      .flatMap((p: any) => p.courses.map((c: any) => c.title))
  );

  const enrolledCourseIds = courses
    .filter(c => approvedCourseTitles.has(c.title) || approvedCourseTitles.has(`${c.title} (1st EMI)`))
    .map(c => c._id || c.id);

  const isEnrolled = enrolledCourseIds.length > 0;
  const myQuizzes = quizzes.filter(q => enrolledCourseIds.includes(q.courseId));
  const myVideos = videos.filter(v => enrolledCourseIds.includes(v.courseId));
  const myNotes = notes.filter(n => enrolledCourseIds.includes(n.courseId));

  const handleStartQuiz = (quiz: any) => {
    setActiveQuiz(quiz);
    setQuizAnswers(new Array(quiz.questions.length).fill(-1));
    setQuizResult(null);
    setSubmitError('');
  };

  const handleSubmitQuiz = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError('');
      const response = await fetch('/api/quizzes?action=submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: activeQuiz._id || activeQuiz.id,
          userId: user?.email || 'unknown',
          userEmail: user?.email || 'unknown',
          answers: quizAnswers
        })
      });
      
      if (!response.ok) {
         const errData = await response.json().catch(() => ({}));
         throw new Error(errData.error || 'Failed to submit quiz');
      }
      
      const result = await response.json();
      setQuizResult(result);
    } catch (err: any) {
      console.error("Failed to submit quiz", err);
      setSubmitError(err?.message || 'Error connecting to server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#f0f4f8', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Mobile backdrop */}
      <div className={`sidebar-backdrop ${isNavOpen && isMobile ? 'visible' : ''}`} onClick={() => setIsNavOpen(false)} />

      {/* ─── DARK SIDEBAR ─── */}
      <aside className={`app-sidebar ${isNavOpen ? 'open' : ''}`} style={{
        width: isNavOpen ? '260px' : '72px',
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
        background: 'linear-gradient(180deg, #0f172a 0%, #131f35 100%)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column',
        height: '100vh', overflowY: 'auto', position: 'sticky', top: 0, flexShrink: 0,
        boxShadow: '4px 0 32px rgba(0,0,0,0.2)',
        zIndex: 200,
      }}>
        {/* Logo */}
        <div style={{
          padding: isNavOpen ? '26px 20px 22px' : '26px 0 22px',
          display: 'flex', alignItems: 'center',
          justifyContent: isNavOpen ? 'flex-start' : 'center',
          gap: '14px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            width: '42px', height: '42px', flexShrink: 0,
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(37,99,235,0.45)',
          }}>
            <span style={{ color: '#fff', fontWeight: '900', fontSize: '15px', letterSpacing: '-1px' }}>NA</span>
          </div>
          {isNavOpen && (
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#f1f5f9', letterSpacing: '0.4px', lineHeight: 1.2 }}>ACHIEVERS HUB</div>
              <div style={{ fontSize: '10px', color: '#475569', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '3px' }}>Learning Portal</div>
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
          {NAV_ITEMS.map((item) => {
            const isActive = activeNav === item.label;
            return (
              <div
                key={item.label}
                onClick={() => handleNavClick(item.label)}
                onMouseEnter={() => setHoveredNav(item.label)}
                onMouseLeave={() => setHoveredNav(null)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '11px 12px', borderRadius: '10px',
                  cursor: 'pointer', marginBottom: '2px',
                  justifyContent: isNavOpen ? 'flex-start' : 'center',
                  background: isActive
                    ? 'linear-gradient(90deg, rgba(37,99,235,0.28) 0%, rgba(37,99,235,0.08) 100%)'
                    : hoveredNav === item.label
                    ? 'rgba(255,255,255,0.05)'
                    : 'transparent',
                  color: isActive ? '#60a5fa' : hoveredNav === item.label ? '#cbd5e1' : '#475569',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '13.5px',
                  transition: 'all 0.15s ease',
                  borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                }}
              >
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                {isNavOpen && <span style={{ letterSpacing: '0.1px' }}>{item.label}</span>}
                {isNavOpen && isActive && (
                  <span style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />
                )}
              </div>
            );
          })}
        </nav>

        {/* Student Profile */}
        <div style={{
          padding: isNavOpen ? '16px 20px' : '16px 0',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: isNavOpen ? 'column' : 'column',
          alignItems: isNavOpen ? 'stretch' : 'center',
          gap: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: isNavOpen ? 'flex-start' : 'center' }}>
            {user?.picture ? (
              <img src={user.picture} alt={user.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(37,99,235,0.4)', flexShrink: 0 }} />
            ) : (
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#fff', fontWeight: '800', fontSize: '14px' }}>{user?.name?.[0]?.toUpperCase() ?? 'S'}</span>
              </div>
            )}
            {isNavOpen && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name ?? 'Student'}</div>
                <div style={{ fontSize: '11px', color: '#475569', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email ?? ''}</div>
              </div>
            )}
          </div>
          {isNavOpen && (
            <button
              onClick={handleSignOut}
              style={{ width: '100%', padding: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#f87171', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          )}
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="app-main" style={{ flex: 1, overflowY: 'auto', minWidth: 0, display: 'flex', flexDirection: 'column' }}>

        {/* ── STICKY GLASS HEADER ── */}
        <header className="app-header" style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: 'rgba(240,244,248,0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(226,232,240,0.9)',
          padding: '0 40px',
          height: '64px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setIsNavOpen(!isNavOpen)}
              style={{
                background: '#fff', border: '1px solid #e2e8f0', cursor: 'pointer',
                padding: '8px', borderRadius: '8px', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div>
              <h1 style={{ color: '#0f172a', fontSize: '18px', fontWeight: '800', margin: 0, letterSpacing: '-0.3px' }}>
                {activeNav === 'Courses' ? '📖 All Courses' : activeNav}
              </h1>
              {activeNav === 'Courses' && (
                <p style={{ color: '#94a3b8', fontSize: '11.5px', margin: '1px 0 0', fontWeight: '500' }}>
                  {courses.length} premium courses available
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Search */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" style={{ position: 'absolute', left: '12px' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                placeholder="Search courses…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  paddingLeft: '36px', paddingRight: '16px', paddingTop: '9px', paddingBottom: '9px',
                  background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
                  fontSize: '13px', color: '#0f172a', outline: 'none', width: '220px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
                className="header-search"
              />
            </div>
            {/* Cart */}
            <button
              onClick={onOpenCart}
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#fff', border: 'none', padding: '10px 20px',
                borderRadius: '10px', cursor: 'pointer', fontWeight: '700',
                fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 4px 16px rgba(37,99,235,0.38)',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              My Cart
              {cartCount > 0 && (
                <span style={{ background: '#fff', color: '#2563eb', borderRadius: '50%', width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '900' }}>
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <div className="content-area" style={{ padding: '36px 40px', flex: 1 }}>

          {/* ─── COURSES TAB ─── */}
          {activeNav === 'Courses' && (
            <>
              {/* HERO BANNER */}
              <div className="hero-section" style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 45%, #2563eb 100%)',
                borderRadius: '20px', padding: '44px 52px', marginBottom: '32px',
                position: 'relative', overflow: 'hidden',
                boxShadow: '0 24px 64px rgba(15,23,42,0.28)',
              }}>
                <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-80px', right: '60px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(37,99,235,0.12)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: '40px', right: '180px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(124,58,237,0.1)', pointerEvents: 'none' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '5px 14px', marginBottom: '18px' }}>
                    <span style={{ color: '#fbbf24', fontSize: '11px' }}>★★★★★</span>
                    <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', fontWeight: '600' }}>Trusted by 5,000+ Nursing Students</span>
                  </div>
                  <h2 className="hero-title" style={{ color: '#fff', fontSize: '34px', fontWeight: '900', margin: '0 0 12px', letterSpacing: '-0.8px', lineHeight: 1.18 }}>
                    Ace NORCET 11 with<br />
                    <span style={{ background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                      India's Best Nursing Courses
                    </span>
                  </h2>
                  <p className="hero-subtitle" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: '0 0 32px', maxWidth: '500px', lineHeight: 1.75 }}>
                    Expert-curated content, HD video lectures, premium notes, and daily quizzes — everything you need to crack NORCET 11.
                  </p>
                  <div className="stat-row" style={{ display: 'flex', gap: '40px' }}>
                    {STATS.map(s => (
                      <div key={s.label}>
                        <div style={{ fontSize: '24px', fontWeight: '900', color: '#fff', letterSpacing: '-0.5px' }}>{s.value}</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontWeight: '500', marginTop: '3px' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* FEATURE CARDS */}
              <div className="feature-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '36px' }}>
                {FEATURE_CARDS.map((f) => (
                  <div key={f.title} style={{
                    background: f.gradient, borderRadius: '16px', padding: '26px',
                    boxShadow: `0 10px 28px ${f.shadow}`,
                    position: 'relative', overflow: 'hidden',
                  }}>
                    <div style={{ position: 'absolute', top: '-24px', right: '-24px', width: '110px', height: '110px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: '-30px', left: '-10px', width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                    <div style={{ fontSize: '30px', marginBottom: '12px', position: 'relative' }}>{f.icon}</div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#fff', marginBottom: '6px', position: 'relative' }}>{f.title}</div>
                    <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, position: 'relative' }}>{f.desc}</div>
                  </div>
                ))}
              </div>

              {/* COURSES HEADER ROW */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>Available Courses</h3>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500', background: '#f1f5f9', padding: '4px 12px', borderRadius: '20px' }}>{filteredCourses.length} courses</span>
              </div>

              {/* COURSE CARDS */}
              <div className="course-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {filteredCourses.map((course, index) => (
                  <div
                    key={index}
                    onMouseEnter={() => setHoveredCard(index)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: '18px',
                      border: `1px solid ${hoveredCard === index ? '#bfdbfe' : '#e8edf2'}`,
                      overflow: 'hidden',
                      boxShadow: hoveredCard === index
                        ? '0 20px 48px rgba(37,99,235,0.14), 0 4px 16px rgba(0,0,0,0.06)'
                        : '0 2px 12px rgba(0,0,0,0.05)',
                      transform: hoveredCard === index ? 'translateY(-7px)' : 'translateY(0)',
                      transition: 'all 0.28s cubic-bezier(0.4,0,0.2,1)',
                    }}
                  >
                    {/* Banner */}
                    <div style={{ height: '168px', background: course.gradient, position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', bottom: '-30px', right: '-30px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
                      <div style={{ position: 'absolute', top: '-40px', left: '-20px', width: '130px', height: '130px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', right: '16px', bottom: '8px' }}>
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                      </svg>
                      <div style={{ position: 'absolute', top: '14px', left: '14px', backgroundColor: course.badgeColor, color: '#fff', fontSize: '10px', fontWeight: '800', padding: '4px 11px', borderRadius: '5px', letterSpacing: '0.9px', boxShadow: '0 3px 10px rgba(0,0,0,0.25)' }}>
                        {course.badge}
                      </div>
                      <div style={{ position: 'absolute', bottom: '14px', right: '14px', background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(6px)', color: 'rgba(255,255,255,0.9)', fontSize: '10px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px' }}>
                        {course.level}
                      </div>
                      <div style={{ position: 'absolute', bottom: '14px', left: '14px', fontSize: '10px', fontWeight: '800', color: course.accentColor, letterSpacing: '0.7px' }}>
                        ACHIEVERS HUB
                      </div>
                    </div>

                    {/* Body */}
                    <div style={{ padding: '22px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px', lineHeight: 1.35, letterSpacing: '-0.2px' }}>
                        {course.title}
                      </h3>
                      <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 14px', lineHeight: 1.65 }}>
                        {course.description}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#92400e' }}>{Number(course.rating).toFixed(1)}</span>
                        <StarRating rating={course.rating} />
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>({course.reviews.toLocaleString()})</span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '18px', flexWrap: 'wrap' }}>
                        {[`📹 ${course.lectures} lectures`, `⏱ ${course.hours}h`].map(t => (
                          <span key={t} style={{ background: '#f1f5f9', color: '#475569', fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px' }}>{t}</span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                        <span style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.8px' }}>
                          ₹{course.price.toLocaleString()}
                        </span>
                        {course.price < course.originalPrice && (
                          <>
                            <span style={{ fontSize: '13px', color: '#94a3b8', textDecoration: 'line-through' }}>₹{course.originalPrice.toLocaleString()}</span>
                            <span style={{ fontSize: '11px', color: '#059669', fontWeight: '800', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '5px' }}>
                              {Math.round((1 - course.price / course.originalPrice) * 100)}% OFF
                            </span>
                          </>
                        )}
                      </div>
                      {(() => {
                        const hasFullAccess = approvedCourseTitles.has(course.title);
                        const hasFirstEmi = approvedCourseTitles.has(`${course.title} (1st EMI)`);
                        const hasSecondEmi = approvedCourseTitles.has(`${course.title} (2nd EMI)`);
                        
                        const isEnrolledInCourse = hasFullAccess || hasFirstEmi;
                        const needsSecondEmi = hasFirstEmi && !hasSecondEmi && !hasFullAccess;

                        return isEnrolledInCourse ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => handleNavClick('Video Lectures')}
                                style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5,150,105,0.3)' }}
                              >
                                ▶ Videos
                              </button>
                              <button
                                onClick={() => handleNavClick('Mock Tests')}
                                style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}
                              >
                                📝 Quizzes
                              </button>
                            </div>
                            {needsSecondEmi && (
                              <button
                                onClick={() => onEnroll({ title: `${course.title} (2nd EMI)`, price: course.price / 2 })}
                                style={{ width: '100%', padding: '10px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                              >
                                ⚠ Pay 2nd EMI (₹{(course.price / 2).toLocaleString()})
                              </button>
                            )}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                            <button
                              onClick={() => onEnroll({ title: course.title, price: course.price })}
                              style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', boxShadow: '0 5px 16px rgba(37,99,235,0.35)' }}
                            >
                              Pay in Full (₹{course.price.toLocaleString()})
                            </button>
                            <button
                              onClick={() => onEnroll({ title: `${course.title} (1st EMI)`, price: course.price / 2 })}
                              style={{ width: '100%', padding: '12px', background: '#f8fafc', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                            >
                              Pay 1st EMI (₹{(course.price / 2).toLocaleString()})
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── MOCK TESTS TAB ─── */}
          {activeNav === 'Mock Tests' && isEnrolled && !activeQuiz && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '20px' }}>My Mock Tests</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {myQuizzes.map(quiz => (
                  <div key={quiz._id || quiz.id} style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ background: '#f0fdf4', color: '#059669', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px' }}>{quiz.level}</span>
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{quiz.questions?.length} Qs</span>
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 8px', color: '#1e293b' }}>{quiz.title}</h3>
                    {quiz.topic && <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px' }}>📌 {quiz.topic}</p>}
                    <button
                      onClick={() => handleStartQuiz(quiz)}
                      style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Start Quiz →
                    </button>
                  </div>
                ))}
                {myQuizzes.length === 0 && (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>📝</div>
                    <p style={{ fontSize: '15px', fontWeight: '600' }}>No quizzes available for your enrolled courses yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeNav === 'Mock Tests' && isEnrolled && activeQuiz && (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px', maxWidth: '800px', margin: '0 auto', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <button onClick={() => setActiveQuiz(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', fontSize: '14px', padding: 0 }}>
                ← Back to Quizzes
              </button>
              
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', marginBottom: '24px' }}>{activeQuiz.title}</h2>
              
              {quizResult ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>{quizResult.score >= activeQuiz.questions.length / 2 ? '🎉' : '📚'}</div>
                  <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: '0 0 10px' }}>Quiz Completed!</h3>
                  <p style={{ fontSize: '18px', color: '#64748b', fontWeight: '600', margin: '0 0 32px' }}>
                    Your score: <span style={{ color: '#2563eb', fontSize: '24px' }}>{quizResult.score}</span> / {quizResult.totalMarks}
                  </p>
                  
                  <div style={{ textAlign: 'left', marginTop: '20px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>Review Answers:</h4>
                    {activeQuiz.questions.map((q: any, i: number) => {
                      const isCorrect = Number(quizAnswers[i]) === Number(q.answer);
                      return (
                        <div key={i} style={{ marginBottom: '24px', padding: '20px', borderRadius: '12px', background: isCorrect ? '#f0fdf4' : '#fef2f2', border: `1px solid ${isCorrect ? '#bbf7d0' : '#fecaca'}` }}>
                          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 16px', lineHeight: 1.5 }}>
                            <span style={{ color: isCorrect ? '#059669' : '#ef4444', marginRight: '8px' }}>{i + 1}.</span>
                            {q.questionText}
                          </h3>
                          {q.questionCode && (
                            <pre style={{ background: '#1e293b', color: '#e2e8f0', padding: '16px', borderRadius: '8px', fontSize: '13px', overflowX: 'auto', marginBottom: '16px' }}>
                              {q.questionCode}
                            </pre>
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {q.options.map((opt: string, oi: number) => {
                              let optBg = '#f8fafc';
                              let optBorder = '#e2e8f0';
                              let optColor = '#334155';
                              let optIcon = '';

                              if (Number(oi) === Number(q.answer)) {
                                optBg = '#dcfce7';
                                optBorder = '#86efac';
                                optColor = '#166534';
                                optIcon = ' ✓';
                              } else if (Number(oi) === Number(quizAnswers[i])) {
                                optBg = '#fee2e2';
                                optBorder = '#fca5a5';
                                optColor = '#991b1b';
                                optIcon = ' ✗';
                              }

                              return (
                                <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: optBg, border: `1px solid ${optBorder}`, borderRadius: '10px' }}>
                                  <div style={{ 
                                    width: '18px', height: '18px', borderRadius: '50%', 
                                    border: `2px solid ${Number(oi) === Number(q.answer) ? '#166534' : Number(oi) === Number(quizAnswers[i]) ? '#991b1b' : '#cbd5e1'}`, 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    background: Number(oi) === Number(q.answer) ? '#166534' : Number(oi) === Number(quizAnswers[i]) ? '#991b1b' : 'transparent'
                                  }}>
                                    {(Number(oi) === Number(q.answer) || Number(oi) === Number(quizAnswers[i])) && (
                                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />
                                    )}
                                  </div>
                                  <span style={{ fontSize: '14px', color: optColor, fontWeight: Number(oi) === Number(q.answer) || Number(oi) === Number(quizAnswers[i]) ? '600' : '500' }}>
                                    {opt}{optIcon}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          {q.explanation ? (
                            <div style={{ marginTop: '16px', fontSize: '13px', color: '#475569', background: 'rgba(255,255,255,0.7)', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                              <strong style={{ color: '#1e293b' }}>💡 Explanation:</strong> <br/> {q.explanation}
                            </div>
                          ) : (
                            <div style={{ marginTop: '16px', fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', padding: '12px', background: 'rgba(255,255,255,0.4)', borderRadius: '8px' }}>
                              No explanation provided for this question.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <button onClick={() => setActiveQuiz(null)} style={{ marginTop: '24px', padding: '12px 32px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
                    Continue Learning
                  </button>
                </div>
              ) : (
                <div>
                  {activeQuiz.questions.map((q: any, i: number) => (
                    <div key={i} style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 16px', lineHeight: 1.5 }}>
                        <span style={{ color: '#2563eb', marginRight: '8px' }}>{i + 1}.</span>
                        {q.questionText}
                      </h3>
                      {q.questionCode && (
                        <pre style={{ background: '#1e293b', color: '#e2e8f0', padding: '16px', borderRadius: '8px', fontSize: '13px', overflowX: 'auto', marginBottom: '16px' }}>
                          {q.questionCode}
                        </pre>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {q.options.map((opt: string, oi: number) => (
                          <label key={oi} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: quizAnswers[i] === oi ? '#eff6ff' : '#f8fafc', border: `1px solid ${quizAnswers[i] === oi ? '#bfdbfe' : '#e2e8f0'}`, borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s' }}>
                            <input 
                              type="radio" 
                              name={`question-${i}`} 
                              checked={quizAnswers[i] === oi} 
                              onChange={() => {
                                const newAnswers = [...quizAnswers];
                                newAnswers[i] = oi;
                                setQuizAnswers(newAnswers);
                              }}
                              style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '14px', color: '#334155', fontWeight: quizAnswers[i] === oi ? '600' : '500' }}>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {submitError && (
                    <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: '600', marginBottom: '12px', textAlign: 'right' }}>
                      ⚠ {submitError}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                    <button 
                      onClick={handleSubmitQuiz}
                      disabled={isSubmitting}
                      style={{ padding: '14px 32px', background: isSubmitting ? '#cbd5e1' : 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '15px', cursor: isSubmitting ? 'not-allowed' : 'pointer', boxShadow: isSubmitting ? 'none' : '0 4px 14px rgba(37,99,235,0.3)' }}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── VIDEO LECTURES TAB ─── */}
          {activeNav === 'Video Lectures' && isEnrolled && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '20px' }}>My Video Lectures</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {myVideos.map(video => {
                  const url = video.youtubeUrl || video.url || '';
                  const videoId = url ? (url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/) || [])[1] : null;
                  return (
                    <div key={video._id || video.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                      <div style={{ height: '180px', background: '#0f172a', position: 'relative' }}>
                        {videoId ? (
                          <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${videoId}`} title={video.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>No Video</div>
                        )}
                        {video.videoType && <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(37,99,235,0.9)', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '4px 8px', borderRadius: '4px' }}>{video.videoType}</span>}
                      </div>
                      <div style={{ padding: '20px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 8px', color: '#1e293b' }}>{video.title}</h3>
                        {video.description && <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px', lineHeight: 1.5 }}>{video.description}</p>}
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '6px' }}>
                            {courses.find(c => (c._id || c.id) === video.courseId)?.title || 'Course Video'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {myVideos.length === 0 && (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎥</div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#475569', margin: '0 0 8px' }}>No Videos Yet</h3>
                    <p style={{ fontSize: '14px', fontWeight: '500', margin: 0 }}>Video lectures for your enrolled courses will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── STUDY NOTES TAB ─── */}
          {activeNav === 'Study Notes' && isEnrolled && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '20px' }}>My Study Notes</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {myNotes.map(note => (
                  <div key={note._id || note.id} style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ width: '72px', height: '72px', borderRadius: '18px', background: note.fileName?.endsWith('.pdf') ? '#fef2f2' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', marginBottom: '20px' }}>
                      {note.fileName?.endsWith('.pdf') ? '📄' : '📝'}
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 8px', color: '#1e293b' }}>{note.title}</h3>
                    {note.description && <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px', lineHeight: 1.5 }}>{note.description}</p>}
                    <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '6px', marginBottom: '20px' }}>
                      {courses.find(c => (c._id || c.id) === note.courseId)?.title || 'Course Note'}
                    </span>
                    {note.fileUrl ? (
                      <a href={note.fileUrl} target="_blank" rel="noopener noreferrer" style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', textDecoration: 'none', display: 'inline-block', boxSizing: 'border-box', boxShadow: '0 4px 14px rgba(124,58,237,0.3)' }}>
                        Open Document →
                      </a>
                    ) : (
                      <button disabled style={{ width: '100%', padding: '12px', background: '#e2e8f0', color: '#94a3b8', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px' }}>
                        Processing...
                      </button>
                    )}
                  </div>
                ))}
                {myNotes.length === 0 && (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#475569', margin: '0 0 8px' }}>No Notes Yet</h3>
                    <p style={{ fontSize: '14px', fontWeight: '500', margin: 0 }}>Study materials for your enrolled courses will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── MY PROGRESS TAB ─── */}
          {activeNav === 'My Progress' && isEnrolled && (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8', background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', maxWidth: '600px', margin: '0 auto', marginTop: '40px' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>📈</div>
              <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: '0 0 12px' }}>My Progress</h2>
              <p style={{ fontSize: '15px', fontWeight: '500', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6 }}>
                We are currently tracking your learning journey! Detailed analytics and progress reports are coming in the next update.
              </p>
            </div>
          )}

          {/* ─── OTHER TABS — Premium Lock Screen ─── */}
          {activeNav !== 'Courses' && !isEnrolled && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '65vh', textAlign: 'center' }}>
              <div style={{
                width: '88px', height: '88px',
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                borderRadius: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '28px',
                boxShadow: '0 16px 40px rgba(37,99,235,0.28)',
              }}>
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.92)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: '0 0 10px', letterSpacing: '-0.4px' }}>
                {activeNav}
              </h2>
              <p style={{ fontSize: '14px', color: '#94a3b8', maxWidth: '380px', lineHeight: 1.75, margin: '0 0 32px' }}>
                This section unlocks once you enroll in a course. Purchase a course to access all {activeNav.toLowerCase()} content.
              </p>
              <button
                onClick={() => setActiveNav('Courses')}
                style={{
                  padding: '13px 32px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#fff', border: 'none', borderRadius: '10px',
                  fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                  boxShadow: '0 5px 16px rgba(37,99,235,0.35)',
                }}
              >
                Browse Courses →
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default NursingAchieversPortal;