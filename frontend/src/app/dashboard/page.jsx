'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) { router.push('/login'); return; }
  }, [user, loading, router]);

  if (loading || !user) return <div className="auth-loading"><div className="auth-spinner" /></div>;

  const saveProfile = async (e) => {
    e.preventDefault(); setProfileLoading(true); setProfileMsg('');
    try {
      const { data } = await api.put('/auth/profile', { name: editName });
      updateUser(data.user); setProfileMsg('✓ Profile updated');
    } catch (err) { setProfileMsg(err.response?.data?.message || 'Update failed'); }
    finally { setProfileLoading(false); }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pw.next !== pw.confirm) { setPwMsg('Passwords do not match'); return; }
    setPwLoading(true); setPwMsg('');
    try {
      await api.put('/auth/password', { currentPassword: pw.current, newPassword: pw.next });
      setPwMsg('✓ Password updated'); setPw({ current:'', next:'', confirm:'' });
    } catch (err) { setPwMsg(err.response?.data?.message || 'Failed to update'); }
    finally { setPwLoading(false); }
  };

  const clearHistory = async () => { await api.delete('/recommend/history'); setHistory([]); };

  return (
    <main>
      <div className="app-wrapper">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-sub">Welcome back, <span className="gradient-text">{user.name}</span></p>
          </div>
          <div className="dashboard-role-badge">{user.role === 'admin' ? '⚡ Admin' : '◆ User'}</div>
        </div>

        <div className="dashboard-grid">
          <div className="dash-card">
            <div className="dash-card-title">Profile</div>
            <div className="profile-avatar-row">
              <div className="profile-avatar">{user.name.charAt(0).toUpperCase()}</div>
              <div>
                <div className="profile-name">{user.name}</div>
                <div className="profile-email">{user.email}</div>
              </div>
            </div>
            <p className="dashboard-sub">
              This simplified dashboard shows your authenticated session using the login, signup, and session APIs.
            </p>
          </div>
        </div>
      </div>

    </main>
  );
}
