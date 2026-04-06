'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { useAuthModal } from '../context/AuthModalContext';

/** Routes that require sign-in; modal opens automatically when visited logged out. Only Agents is gated — other app pages stay open to guests. */
export const AUTH_REQUIRED_PREFIXES = ['/agents'];

function pathRequiresAuth(pathname) {
  return AUTH_REQUIRED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export default function AuthRouteWatcher() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { openAuthModal, closeAuthModal } = useAuthModal();
  const openedForPathRef = useRef(null);

  useEffect(() => {
    if (loading) return;

    if (user) {
      closeAuthModal();
      openedForPathRef.current = null;
      return;
    }

    if (!pathRequiresAuth(pathname)) {
      openedForPathRef.current = null;
      return;
    }

    if (openedForPathRef.current === pathname) return;

    openedForPathRef.current = pathname;
    openAuthModal({ tab: 'signin', returnTo: pathname });
  }, [loading, user, pathname, openAuthModal, closeAuthModal]);

  return null;
}
