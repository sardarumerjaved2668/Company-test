'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const AuthModalContext = createContext(null);

export function AuthModalProvider({ children }) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('signin');
  const [returnTo, setReturnTo] = useState('/');

  const openAuthModal = useCallback((opts = {}) => {
    setAuthModalTab(opts.tab === 'signup' ? 'signup' : 'signin');
    setReturnTo(typeof opts.returnTo === 'string' ? opts.returnTo : '/');
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const auth = params.get('auth');
    if (auth === 'signin' || auth === 'signup') {
      setAuthModalTab(auth === 'signup' ? 'signup' : 'signin');
      setReturnTo(params.get('returnTo') || '/');
      setAuthModalOpen(true);
      const u = new URL(window.location.href);
      u.searchParams.delete('auth');
      u.searchParams.delete('returnTo');
      const q = u.searchParams.toString();
      window.history.replaceState({}, '', u.pathname + (q ? `?${q}` : ''));
      return;
    }
    const stored = sessionStorage.getItem('nexusai:openAuth');
    if (stored === 'signin' || stored === 'signup') {
      sessionStorage.removeItem('nexusai:openAuth');
      setAuthModalTab(stored === 'signup' ? 'signup' : 'signin');
      setReturnTo('/');
      setAuthModalOpen(true);
    }
  }, []);

  const value = useMemo(
    () => ({
      authModalOpen,
      authModalTab,
      setAuthModalTab,
      returnTo,
      openAuthModal,
      closeAuthModal,
    }),
    [authModalOpen, authModalTab, returnTo, openAuthModal, closeAuthModal]
  );

  return (
    <AuthModalContext.Provider value={value}>{children}</AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error('useAuthModal must be used within AuthModalProvider');
  return ctx;
}
