'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { useAuthModal } from '../context/AuthModalContext';
import { useLocale } from '../context/LocaleContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { locale, setLocale, t, languages } = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [langOpen, setLangOpen] = useState(false);

  const activeLang = languages.find((l) => l.id === locale) || languages[0];

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleSelectLang = (lang) => {
    setLocale(lang.id);
    setLangOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link className="logo" href="/">
          <div className="logo-icon">✦</div>
          <span className="logo-text">
            <span className="logo-nexus">Nexus</span>
            <span className="logo-ai">AI</span>
          </span>
        </Link>

        <div className="nav-actions">
          <div className="nav-links">
            <Link href="/chat-hub" className={`nav-link${pathname === '/chat-hub' ? ' nav-link-active' : ''}`}>
              {t('nav.chatHub')}
            </Link>
            <Link href="/marketplace" className={`nav-link${pathname === '/marketplace' ? ' nav-link-active' : ''}`}>
              {t('nav.marketplace')}
            </Link>
            <Link href="/agents" className={`nav-link${pathname === '/agents' ? ' nav-link-active' : ''}`}>
              {t('nav.agents')}
            </Link>
            <Link href="/discover-new" className={`nav-link${pathname === '/discover-new' ? ' nav-link-active' : ''}`}>
              {t('nav.discoverNew')}
            </Link>
          </div>

          <div className="nav-lang-wrapper">
            <button
              type="button"
              className="nav-lang"
              onClick={() => setLangOpen((open) => !open)}
            >
              <span className="nav-lang-globe">🌐</span>
              <span>{activeLang.code}</span>
            </button>
            {langOpen && (
              <div className="nav-lang-menu">
                <div className="nav-lang-header">{t('nav.appLanguage')}</div>
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    className={`nav-lang-item${lang.id === activeLang.id ? ' nav-lang-item-active' : ''}`}
                    onClick={() => handleSelectLang(lang)}
                  >
                    <span className="nav-lang-region">{lang.region}</span>
                    <span className="nav-lang-label">
                      <span className="nav-lang-label-code">{lang.code}</span>{' '}
                      <span className="nav-lang-label-text">{lang.label}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <>
              <Link href="/dashboard" className={`nav-link${pathname === '/dashboard' ? ' nav-link-active' : ''}`}>
                {t('nav.dashboard')}
              </Link>
              <div className="nav-user">
                <div className="nav-avatar">{user.name.charAt(0).toUpperCase()}</div>
                <span className="nav-username">{user.name}</span>
              </div>
              <button type="button" className="btn-nav-logout" onClick={handleLogout}>{t('nav.logout')}</button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="nav-link nav-link-btn"
                onClick={() => openAuthModal({ tab: 'signin', returnTo: pathname })}
              >
                {t('nav.signIn')}
              </button>
              <Link href="/marketplace?model=gpt5&details=1" className="btn-nav-cta">{t('nav.tryFree')}</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
