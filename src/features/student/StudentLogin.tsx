import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth, ADMIN_EMAILS } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Admin password — change this to whatever you prefer
const ADMIN_PASSWORD = 'admin@123';

// Detect if a real Google Client ID has been configured
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
const GOOGLE_CONFIGURED = Boolean(
  GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE',
);

export const StudentLogin = () => {
  const { login } = useAuth();
  const navigate   = useNavigate();

  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminEmail, setAdminEmail]       = useState('');
  const [adminPass, setAdminPass]         = useState('');
  const [adminError, setAdminError]       = useState('');

  // ── Admin direct login ────────────────────────────────────────────────────
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    if (!ADMIN_EMAILS.includes(adminEmail.trim().toLowerCase())) {
      setAdminError('This email is not in the admin list.');
      return;
    }
    if (adminPass !== ADMIN_PASSWORD) {
      setAdminError('Incorrect password.');
      return;
    }
    const name = adminEmail.split('@')[0]
      .replace(/\./g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    login({ email: adminEmail.trim().toLowerCase(), name, picture: '', sub: `admin-${Date.now()}` });
    navigate('/admin/dashboard');
  };

  // ── Google OAuth login ────────────────────────────────────────────────────
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        const res     = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const profile = await res.json() as { email: string; name: string; picture: string; sub: string };
        login(profile);
        if (ADMIN_EMAILS.includes(profile.email.toLowerCase())) {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } catch {
        setError('Could not fetch account details. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setLoading(false);
      setError('Google sign-in was cancelled or failed. Please try again.');
    },
  });

  const inputCss: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.07)',
    color: '#f1f5f9', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 55%, #2563eb 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Blobs */}
      <div style={{ position: 'absolute', top: '-120px', right: '-120px', width: '480px', height: '480px', borderRadius: '50%', background: 'rgba(37,99,235,0.1)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-160px', left: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(124,58,237,0.08)', pointerEvents: 'none' }} />

      {/* Card */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderRadius: '24px', padding: '48px 44px',
        width: '100%', maxWidth: '420px',
        position: 'relative', zIndex: 1,
        boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '60px', height: '60px', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 28px rgba(37,99,235,0.5)',
          }}>
            <span style={{ color: '#fff', fontWeight: '900', fontSize: '20px', letterSpacing: '-1.5px' }}>NA</span>
          </div>
          <h1 style={{ color: '#f1f5f9', fontSize: '22px', fontWeight: '900', margin: '0 0 6px', letterSpacing: '-0.4px' }}>
            Nursing Achievers
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0, fontWeight: '500' }}>
            India's Premier Nursing Exam Platform
          </p>
        </div>

        {!showAdminForm ? (
          /* ── STUDENT / GOOGLE LOGIN ── */
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: '#fff', fontSize: '17px', fontWeight: '800', margin: '0 0 6px', letterSpacing: '-0.2px' }}>
                Welcome! Sign in to continue
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>
                Use your Google account to access courses, notes &amp; more
              </p>
            </div>

            {GOOGLE_CONFIGURED ? (
              <button
                onClick={() => { setError(''); setLoading(true); handleGoogleLogin(); }}
                disabled={loading}
                style={{
                  width: '100%', padding: '14px 20px',
                  background: loading ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.97)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(0,0,0,0.25)',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? (
                  <>
                    <div style={{ width: '20px', height: '20px', border: '2px solid rgba(37,99,235,0.3)', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>Signing in…</span>
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span style={{ fontSize: '14.5px', fontWeight: '700', color: '#1e293b' }}>Continue with Google</span>
                  </>
                )}
              </button>
            ) : (
              <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '22px', marginBottom: '8px' }}>⚙️</div>
                <p style={{ color: '#fcd34d', fontSize: '13px', fontWeight: '600', margin: '0 0 4px' }}>
                  Google Sign-In setup required
                </p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0, lineHeight: 1.6 }}>
                  Add your Google Client ID to{' '}
                  <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: '4px', fontSize: '11px' }}>.env</code>{' '}
                  to enable student Google login.
                </p>
              </div>
            )}

            {error && (
              <div style={{ marginTop: '12px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 14px', fontSize: '13px', color: '#fca5a5', textAlign: 'center' }}>
                ⚠ {error}
              </div>
            )}

            {/* Feature list */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '24px 0 16px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: '11.5px', fontWeight: '500' }}>What you get</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              {[
                { icon: '🎥', text: '120+ HD Video Lectures for NORCET 11' },
                { icon: '📚', text: 'Premium Study Notes & PDFs' },
                { icon: '🧠', text: 'Daily MCQ Quizzes & Mock Tests' },
                { icon: '📈', text: 'Track your exam progress' },
              ].map(f => (
                <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '15px', flexShrink: 0 }}>{f.icon}</span>
                  <span style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>{f.text}</span>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => { setShowAdminForm(true); setError(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.28)', fontSize: '12px', textDecoration: 'underline', padding: 0 }}
              >
                Admin access
              </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.15)', margin: '14px 0 0' }}>
              By signing in you agree to our Terms of Service &amp; Privacy Policy.
            </p>
          </>
        ) : (
          /* ── ADMIN DIRECT LOGIN ── */
          <>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', marginBottom: '14px', boxShadow: '0 6px 20px rgba(37,99,235,0.4)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: '800', margin: '0 0 6px' }}>Admin Login</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>
                For staff only — use your admin Gmail
              </p>
            </div>

            <form onSubmit={handleAdminLogin}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginBottom: '7px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Admin Email</label>
                <input
                  type="email"
                  placeholder="nursingachievershub@gmail.com"
                  value={adminEmail}
                  onChange={e => { setAdminEmail(e.target.value); setAdminError(''); }}
                  required
                  style={inputCss}
                />
              </div>
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginBottom: '7px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={adminPass}
                  onChange={e => { setAdminPass(e.target.value); setAdminError(''); }}
                  required
                  style={inputCss}
                />
              </div>

              {adminError && (
                <div style={{ marginBottom: '16px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 14px', fontSize: '13px', color: '#fca5a5', textAlign: 'center' }}>
                  ⚠ {adminError}
                </div>
              )}

              <button
                type="submit"
                style={{
                  width: '100%', padding: '13px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#fff', border: 'none', borderRadius: '12px',
                  fontWeight: '700', fontSize: '14.5px', cursor: 'pointer',
                  boxShadow: '0 5px 18px rgba(37,99,235,0.4)',
                }}
              >
                Sign In as Admin →
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                onClick={() => { setShowAdminForm(false); setAdminError(''); setAdminEmail(''); setAdminPass(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                Back
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default StudentLogin;
