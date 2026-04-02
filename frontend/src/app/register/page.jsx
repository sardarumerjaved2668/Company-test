'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError(''); setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      router.push('/dashboard');
    } catch (err) {
      const errs = err.response?.data?.errors;
      setError(errs?.length ? errs.map((e) => e.msg).join('. ') : err.response?.data?.message || 'Registration failed.');
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

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Join NexusAI-DB to save recommendations and track history.</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" placeholder="John Doe" value={form.name} onChange={set('name')} required autoComplete="name" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={set('email')} required autoComplete="email" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required autoComplete="new-password" />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input type="password" className="form-input" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} required autoComplete="new-password" />
          </div>
          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? <><div className="spinner spinner-dark" /> Creating account...</> : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">Already have an account? <Link href="/login" className="auth-link">Sign in</Link></p>
      </div>
    </main>
  );
}
