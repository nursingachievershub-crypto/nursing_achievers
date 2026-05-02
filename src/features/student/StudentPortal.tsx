import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
          rating: c.rating || 4.5 + Math.random() * 0.4,
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* Mobile backdrop */}
      <div className={`sidebar-backdrop ${isNavOpen && isMobile ? 'visible' : ''}`} onClick={() => setIsNavOpen(false)} />

      {/* ─── DARK SIDEBAR ─── */}
      <aside className={`app-sidebar ${isNavOpen ? 'open' : ''}`} style={{
        width: isNavOpen ? '260px' : '72px',
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
        background: 'linear-gradient(180deg, #0f172a 0%, #131f35 100%)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column',
        minHeight: '100vh', position: 'sticky', top: 0,
        flexShrink: 0,
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
              <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#f1f5f9', letterSpacing: '0.4px', lineHeight: 1.2 }}>NURSING ACHIEVERS</div>
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
                        NURSING ACHIEVERS
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
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#92400e' }}>{course.rating}</span>
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
                      <button
                        onClick={() => onEnroll({ title: course.title, price: course.price })}
                        style={{
                          width: '100%', padding: '13px',
                          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                          color: '#fff', border: 'none', borderRadius: '10px',
                          fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                          boxShadow: '0 5px 16px rgba(37,99,235,0.35)',
                          letterSpacing: '0.3px',
                        }}
                      >
                        Enroll Now →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── OTHER TABS — Premium Lock Screen ─── */}
          {activeNav !== 'Courses' && (
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