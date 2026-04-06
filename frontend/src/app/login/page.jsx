'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../context/LocaleContext';

function LoginInner() {
  const { login } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get('from') || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      router.push(from);
    } catch (err) {
      setError(err.response?.data?.message || t('auth.login.loginFailed'));
    } finally { setLoading(false); }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">⬡</div>
          <span className="auth-brand">
            <span className="logo-nexus">Nexus</span><span className="logo-ai">AI</span><span className="logo-db">-DB</span>
          </span>
        </div>

        <h1 className="auth-title">{t('auth.login.title')}</h1>
        <p className="auth-subtitle">{t('auth.login.subtitle')}</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">{t('auth.login.email')}</label>
            <input id="login-email" type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">{t('auth.login.password')}</label>
            <input id="login-password" type="password" className="form-input" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required autoComplete="current-password" />
          </div>
          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? <><div className="spinner spinner-dark" /> {t('auth.login.signingIn')}</> : t('auth.login.signIn')}
          </button>
        </form>

        <p className="auth-switch">{t('auth.login.noAccount')} <Link href="/register" className="auth-link">{t('auth.login.createOne')}</Link></p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-page"><div className="auth-card"><div className="auth-spinner" /></div></div>}>
      <LoginInner />
    </Suspense>
  );
}
