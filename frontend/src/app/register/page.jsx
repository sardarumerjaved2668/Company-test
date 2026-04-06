'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../context/LocaleContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useLocale();
  const router = useRouter();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError(t('auth.register.passwordMismatch')); return; }
    if (form.password.length < 6) { setError(t('auth.register.passwordShort')); return; }
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      router.push('/dashboard');
    } catch (err) {
      const errs = err.response?.data?.errors;
      setError(errs?.length ? errs.map((e) => e.msg).join('. ') : err.response?.data?.message || t('auth.register.registrationFailed'));
    } finally { setLoading(false); }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">⬡</div>
          <span className="auth-brand">
            <span className="logo-nexus">Nexus</span><span className="logo-ai">AI</span><span className="logo-db">-DB</span>
          </span>
        </div>

        <h1 className="auth-title">{t('auth.register.title')}</h1>
        <p className="auth-subtitle">{t('auth.register.subtitle')}</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">{t('auth.register.fullName')}</label>
            <input id="reg-name" type="text" className="form-input" placeholder={t('auth.register.placeholderName')} value={form.name} onChange={set('name')} required autoComplete="name" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">{t('auth.register.email')}</label>
            <input id="reg-email" type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={set('email')} required autoComplete="email" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">{t('auth.register.password')}</label>
            <input id="reg-password" type="password" className="form-input" placeholder={t('auth.register.placeholderPasswordHint')} value={form.password} onChange={set('password')} required autoComplete="new-password" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">{t('auth.register.confirmPassword')}</label>
            <input id="reg-confirm" type="password" className="form-input" placeholder={t('auth.register.placeholderConfirm')} value={form.confirm} onChange={set('confirm')} required autoComplete="new-password" />
          </div>
          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? <><div className="spinner spinner-dark" /> {t('auth.register.creating')}</> : t('auth.register.createAccount')}
          </button>
        </form>

        <p className="auth-switch">{t('auth.register.haveAccount')} <Link href="/login" className="auth-link">{t('auth.register.signInLink')}</Link></p>
      </div>
    </main>
  );
}
