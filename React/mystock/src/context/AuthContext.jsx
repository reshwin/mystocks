import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export const TOKEN_KEY = 'mystock_token';
export const USER_KEY  = 'mystock_user';

export const getStoredToken = () =>
  localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null;

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);  // true while restoring saved session

  useEffect(() => {
    const savedToken = getStoredToken();
    const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (savedToken && raw) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(raw));
      } catch { /* corrupt storage — ignore */ }
    }
    setLoading(false);
  }, []);

  const login = async ({ email, password }, remember) => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Invalid email or password');
    }
    const data = await res.json();     // { token, user: { id, name, email, role, color, avatar } }
    setToken(data.token);
    setUser(data.user);
    const store = remember ? localStorage : sessionStorage;
    store.setItem(TOKEN_KEY, data.token);
    store.setItem(USER_KEY,  JSON.stringify(data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    [localStorage, sessionStorage].forEach(s => {
      s.removeItem(TOKEN_KEY);
      s.removeItem(USER_KEY);
    });
  };

  // Only admin and manager may create / edit / delete anything.
  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, loading, canEdit }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
