'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

const LANGUAGES = [
  { code: 'EN', region: 'US', label: 'English' },
  { code: 'AR', region: 'SA', label: 'العربية' },
  { code: 'FR', region: 'FR', label: 'Français' },
  { code: 'DE', region: 'DE', label: 'Deutsch' },
  { code: 'ES', region: 'ES', label: 'Español' },
  { code: 'PT', region: 'BR', label: 'Português' },
  { code: 'ZH', region: 'CN', label: '中文' },
  { code: 'JA', region: 'JP', label: '日本語' },
  { code: 'KO', region: 'KR', label: '한국어' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [langOpen, setLangOpen] = useState(false);
  const [activeLang, setActiveLang] = useState(LANGUAGES[0]);

  const handleLogout = async () => { await logout(); router.push('/'); };

  const handleSelectLang = (lang) => {
    setActiveLang(lang);
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
              💬 Chat Hub
            </Link>
            <Link href="/marketplace" className={`nav-link${pathname === '/marketplace' ? ' nav-link-active' : ''}`}>
              🛍 Marketplace
            </Link>
            <Link href="/agents" className={`nav-link${pathname === '/agents' ? ' nav-link-active' : ''}`}>
              🤖 Agents
            </Link>
            <Link href="/discover-new" className={`nav-link${pathname === '/discover-new' ? ' nav-link-active' : ''}`}>
              🔬 Discover New
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
                <div className="nav-lang-header">APP LANGUAGE</div>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    className={`nav-lang-item${lang.code === activeLang.code ? ' nav-lang-item-active' : ''}`}
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
                Dashboard
              </Link>
              <div className="nav-user">
                <div className="nav-avatar">{user.name.charAt(0).toUpperCase()}</div>
                <span className="nav-username">{user.name}</span>
              </div>
              <button className="btn-nav-logout" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className={`nav-link${pathname === '/login' ? ' nav-link-active' : ''}`}>Sign in</Link>
              <Link href="/marketplace?model=gpt5&details=1" className="btn-nav-cta">Try free →</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
