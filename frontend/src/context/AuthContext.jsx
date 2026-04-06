'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useLocale } from './LocaleContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { applyServerLocale } = useLocale();
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync token to axios + localStorage + cookie for middleware
  const applyToken = useCallback((token) => {
    setAccessToken(token);
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('accessToken', token);
      document.cookie = `accessToken=${token}; path=/; max-age=3600; SameSite=Strict`;
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('accessToken');
      document.cookie = 'accessToken=; path=/; max-age=0';
    }
  }, []);

  const tryRefresh = useCallback(async () => {
    try {
      const { data } = await api.post('/auth/refresh');
      applyToken(data.accessToken);
      const session = await api.get('/auth/session', { headers: { Authorization: `Bearer ${data.accessToken}` } });
      setUser(session.data.user);
      applyServerLocale(session.data.user?.language);
      return data.accessToken;
    } catch {
      applyToken(null);
      setUser(null);
      return null;
    }
  }, [applyToken]);

  // Bootstrap: check stored token
  useEffect(() => {
    const stored = localStorage.getItem('accessToken');
    if (stored) {
      api.defaults.headers.common['Authorization'] = `Bearer ${stored}`;
      api.get('/auth/session')
        .then(({ data }) => { setAccessToken(stored); setUser(data.user); applyServerLocale(data.user?.language); })
        .catch((err) => {
          if (err.response?.data?.code === 'TOKEN_EXPIRED') tryRefresh();
          else applyToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    applyToken(data.accessToken);
    setUser(data.user);
    applyServerLocale(data.user?.language);
    return data;
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    applyToken(data.accessToken);
    setUser(data.user);
    applyServerLocale(data.user?.language);
    return data;
  };

  const logout = async () => {
    applyToken(null);
    setUser(null);
  };

  const updateUser = (updated) => setUser(updated);

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, register, login, logout, tryRefresh, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
