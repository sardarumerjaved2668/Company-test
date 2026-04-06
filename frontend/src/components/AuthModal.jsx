'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { useAuthModal } from '../context/AuthModalContext';
import { useLocale } from '../context/LocaleContext';
import { AUTH_REQUIRED_PREFIXES } from './AuthRouteWatcher';

function pathRequiresAuth(pathname) {
  return AUTH_REQUIRED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

const LEFT_FEATURES = [
  { icon: '🧬', labelKey: 'f1' },
  { icon: '⚡', labelKey: 'f2' },
  { icon: '🔗', labelKey: 'f3' },
  { icon: '📊', labelKey: 'f4' },
];

function pwStrength(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e'];

export default function AuthModal() {
  const router = useRouter();
  const pathname = usePathname();
  const { t, messages } = useLocale();
  const { login, register } = useAuth();
  const {
    authModalOpen,
    authModalTab,
    setAuthModalTab,
    returnTo,
    closeAuthModal,
  } = useAuthModal();

  const m = messages.auth?.modal || {};

  const [signIn, setSignIn] = useState({ email: '', password: '' });
  const [signUp, setSignUp] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [showPwIn, setShowPwIn] = useState(false);
  const [showPwUp, setShowPwUp] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = pwStrength(signUp.password);

  useEffect(() => {
    if (!authModalOpen) {
      setError('');
      setLoading(false);
    }
  }, [authModalOpen]);

  const handleClose = useCallback(() => {
    closeAuthModal();
    if (pathRequiresAuth(pathname)) {
      router.replace('/');
    }
  }, [closeAuthModal, pathname, router]);

  useEffect(() => {
    if (!authModalOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [authModalOpen, handleClose]);

  const afterAuthNavigate = () => {
    closeAuthModal();
    const dest = returnTo && returnTo !== '' ? returnTo : pathname;
    router.push(dest || '/');
  };

  const onSubmitSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(signIn.email, signIn.password);
      afterAuthNavigate();
    } catch (err) {
      setError(err.response?.data?.message || t('auth.login.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const onSubmitSignUp = async (e) => {
    e.preventDefault();
    if (signUp.password !== signUp.confirm) {
      setError(t('auth.register.passwordMismatch'));
      return;
    }
    if (signUp.password.length < 6) {
      setError(t('auth.register.passwordShort'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(signUp.name, signUp.email, signUp.password);
      afterAuthNavigate();
    } catch (err) {
      const errs = err.response?.data?.errors;
      setError(
        errs?.length
          ? errs.map((x) => x.msg).join('. ')
          : err.response?.data?.message || t('auth.register.registrationFailed')
      );
    } finally {
      setLoading(false);
    }
  };

  const onSocial = () => {
    setError(m.socialSoon || 'Coming soon');
  };

  if (!authModalOpen) return null;

  return (
    <div
      className="auth-modal-overlay"
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <button
          type="button"
          className="auth-modal-close"
          onClick={handleClose}
          aria-label={m.closeAria || 'Close'}
        >
          ×
        </button>

        <div className="auth-modal-split">
          <div className="auth-modal-left">
            <Link href="/" className="auth-modal-logo" onClick={handleClose}>
              <span className="auth-modal-logo-icon">✦</span>
              <span className="auth-modal-logo-text">
                <span className="auth-modal-logo-nexus">Nexus</span>
                <span className="auth-modal-logo-ai">AI</span>
              </span>
            </Link>

            <div className="auth-modal-glow" aria-hidden="true">
              <span className="auth-modal-mascot">🤖</span>
            </div>

            <h2 className="auth-modal-headline" id="auth-modal-title">
              {m.headline || 'Build Smarter with AI Agents.'}
            </h2>
            <p className="auth-modal-sub">
              {m.subhead ||
                'Access 525+ models, create custom agents, and automate your workflow — all in one platform.'}
            </p>

            <ul className="auth-modal-features">
              {LEFT_FEATURES.map((f) => (
                <li key={f.labelKey}>
                  <span className="auth-modal-feat-ico">{f.icon}</span>
                  <span>{m.features?.[f.labelKey] || f.labelKey}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="auth-modal-right">
            <div className="auth-modal-tabs">
              <button
                type="button"
                className={`auth-modal-tab${authModalTab === 'signin' ? ' auth-modal-tab-active' : ''}`}
                onClick={() => {
                  setAuthModalTab('signin');
                  setError('');
                }}
              >
                {m.tabSignIn || 'Sign In'}
              </button>
              <button
                type="button"
                className={`auth-modal-tab${authModalTab === 'signup' ? ' auth-modal-tab-active' : ''}`}
                onClick={() => {
                  setAuthModalTab('signup');
                  setError('');
                }}
              >
                {m.tabSignUp || 'Create Account'}
              </button>
            </div>

            {authModalTab === 'signin' ? (
              <>
                <div className="auth-modal-form-head">
                  <h3 className="auth-modal-welcome">{t('auth.login.title')}</h3>
                  <p className="auth-modal-welcome-sub">{m.welcomeBackSub || t('auth.login.subtitle')}</p>
                </div>

                {error && <div className="auth-error-banner">{error}</div>}

                <form className="auth-modal-form" onSubmit={onSubmitSignIn} noValidate>
                  <div className="auth-field">
                    <label className="auth-field-label" htmlFor="modal-email">
                      {m.emailLabel || t('auth.login.email')}
                    </label>
                    <input
                      id="modal-email"
                      type="email"
                      className="auth-field-input"
                      placeholder={m.emailPh || 'you@company.com'}
                      value={signIn.email}
                      onChange={(e) => setSignIn({ ...signIn, email: e.target.value })}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="auth-field">
                    <label className="auth-field-label" htmlFor="modal-password">
                      {m.passwordLabel || t('auth.login.password')}
                    </label>
                    <div className="auth-pw-wrap">
                      <input
                        id="modal-password"
                        type={showPwIn ? 'text' : 'password'}
                        className="auth-field-input auth-field-pw"
                        placeholder={m.passwordPh || 'Enter your password'}
                        value={signIn.password}
                        onChange={(e) => setSignIn({ ...signIn, password: e.target.value })}
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="auth-pw-toggle"
                        onClick={() => setShowPwIn((v) => !v)}
                        aria-label={showPwIn ? 'Hide password' : 'Show password'}
                      >
                        {showPwIn ? '🙈' : '👁'}
                      </button>
                    </div>
                  </div>
                  <div className="auth-modal-forgot-row">
                    <button type="button" className="auth-modal-forgot" onClick={onSocial}>
                      {m.forgotPassword || 'Forgot password?'}
                    </button>
                  </div>
                  <button type="submit" className="auth-modal-submit" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="auth-btn-spinner" /> {t('auth.login.signingIn')}
                      </>
                    ) : (
                      m.signInCta || t('auth.login.signIn')
                    )}
                  </button>
                </form>

                <div className="auth-modal-divider">
                  <span>{m.orContinue || 'Or continue with'}</span>
                </div>
                <div className="auth-modal-social">
                  <button type="button" className="auth-modal-social-btn" onClick={onSocial}>
                    <span className="auth-modal-soc-ico">G</span> Google
                  </button>
                  <button type="button" className="auth-modal-social-btn" onClick={onSocial}>
                    <span className="auth-modal-soc-ico gh">⌘</span> GitHub
                  </button>
                  <button type="button" className="auth-modal-social-btn" onClick={onSocial}>
                    <span className="auth-modal-soc-ico ms">⊞</span> Microsoft
                  </button>
                </div>

                <p className="auth-modal-switch">
                  {m.noAccount || t('auth.login.noAccount')}{' '}
                  <button
                    type="button"
                    className="auth-modal-switch-link"
                    onClick={() => {
                      setAuthModalTab('signup');
                      setError('');
                    }}
                  >
                    {m.createOne || t('auth.login.createOne')} →
                  </button>
                </p>
              </>
            ) : (
              <>
                <div className="auth-modal-form-head">
                  <h3 className="auth-modal-welcome">{t('auth.register.title')}</h3>
                  <p className="auth-modal-welcome-sub">{t('auth.register.subtitle')}</p>
                </div>

                {error && <div className="auth-error-banner">{error}</div>}

                <form className="auth-modal-form" onSubmit={onSubmitSignUp} noValidate>
                  <div className="auth-field">
                    <label className="auth-field-label" htmlFor="modal-reg-name">
                      {t('auth.register.fullName')}
                    </label>
                    <input
                      id="modal-reg-name"
                      type="text"
                      className="auth-field-input"
                      placeholder={t('auth.register.placeholderName')}
                      value={signUp.name}
                      onChange={(e) => setSignUp({ ...signUp, name: e.target.value })}
                      required
                      autoComplete="name"
                    />
                  </div>
                  <div className="auth-field">
                    <label className="auth-field-label" htmlFor="modal-reg-email">
                      {t('auth.register.email')}
                    </label>
                    <input
                      id="modal-reg-email"
                      type="email"
                      className="auth-field-input"
                      placeholder="you@example.com"
                      value={signUp.email}
                      onChange={(e) => setSignUp({ ...signUp, email: e.target.value })}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="auth-field">
                    <label className="auth-field-label" htmlFor="modal-reg-pw">
                      {t('auth.register.password')}
                    </label>
                    <div className="auth-pw-wrap">
                      <input
                        id="modal-reg-pw"
                        type={showPwUp ? 'text' : 'password'}
                        className="auth-field-input auth-field-pw"
                        placeholder={t('auth.register.placeholderPasswordHint')}
                        value={signUp.password}
                        onChange={(e) => setSignUp({ ...signUp, password: e.target.value })}
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="auth-pw-toggle"
                        onClick={() => setShowPwUp((v) => !v)}
                        aria-label={showPwUp ? 'Hide password' : 'Show password'}
                      >
                        {showPwUp ? '🙈' : '👁'}
                      </button>
                    </div>
                    {signUp.password && (
                      <div className="auth-pw-strength">
                        <div className="auth-pw-bars">
                          {[1, 2, 3, 4].map((n) => (
                            <div
                              key={n}
                              className="auth-pw-bar"
                              style={{
                                background: n <= strength ? STRENGTH_COLORS[strength] : '#e5e7eb',
                              }}
                            />
                          ))}
                        </div>
                        <span
                          className="auth-pw-label"
                          style={{ color: STRENGTH_COLORS[strength] }}
                        >
                          {STRENGTH_LABELS[strength]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="auth-field">
                    <label className="auth-field-label" htmlFor="modal-reg-confirm">
                      {t('auth.register.confirmPassword')}
                    </label>
                    <div className="auth-pw-wrap">
                      <input
                        id="modal-reg-confirm"
                        type={showConfirm ? 'text' : 'password'}
                        className="auth-field-input auth-field-pw"
                        placeholder={t('auth.register.placeholderConfirm')}
                        value={signUp.confirm}
                        onChange={(e) => setSignUp({ ...signUp, confirm: e.target.value })}
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="auth-pw-toggle"
                        onClick={() => setShowConfirm((v) => !v)}
                        aria-label={showConfirm ? 'Hide password' : 'Show password'}
                      >
                        {showConfirm ? '🙈' : '👁'}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="auth-modal-submit" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="auth-btn-spinner" /> {t('auth.register.creating')}
                      </>
                    ) : (
                      t('auth.register.createAccount')
                    )}
                  </button>
                </form>

                <p className="auth-modal-switch">
                  {t('auth.register.haveAccount')}{' '}
                  <button
                    type="button"
                    className="auth-modal-switch-link"
                    onClick={() => {
                      setAuthModalTab('signin');
                      setError('');
                    }}
                  >
                    {t('auth.register.signInLink')}
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
