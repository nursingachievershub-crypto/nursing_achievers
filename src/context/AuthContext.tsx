import React, { createContext, useContext, useState } from 'react';

// ─── Admin access list ────────────────────────────────────────────────────────
export const ADMIN_EMAILS = [
  'nursingachievershub@gmail.com',
  'saikrishna261996@gmail.com',
];

// ─── Types ────────────────────────────────────────────────────────────────────
export interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

interface AuthContextType {
  user: GoogleUser | null;
  isAdmin: boolean;
  login: (user: GoogleUser) => void;
  logout: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'na_google_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<GoogleUser | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as GoogleUser) : null;
    } catch {
      return null;
    }
  });

  const isAdmin = user ? ADMIN_EMAILS.includes(user.email.toLowerCase()) : false;

  const login = (u: GoogleUser) => {
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    // Mark admin flag so AdminDashboard guard still works
    if (ADMIN_EMAILS.includes(u.email.toLowerCase())) {
      localStorage.setItem('isAdmin', 'true');
    }
    // Sync user to MongoDB (fire-and-forget)
    fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: u.email,
        name: u.name,
        avatar: u.picture,
        loginType: ADMIN_EMAILS.includes(u.email.toLowerCase()) ? 'admin' : 'google',
      }),
    }).catch(() => {});
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('isAdmin');
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
};
