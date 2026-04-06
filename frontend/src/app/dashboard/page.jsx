'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../context/LocaleContext';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { t } = useLocale();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) { router.push('/login'); }
  }, [user, loading, router]);

  if (loading || !user) return <div className="auth-loading"><div className="auth-spinner" /></div>;

  return (
    <main>
      <div className="app-wrapper">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">{t('dashboard.title')}</h1>
            <p className="dashboard-sub">
              {t('dashboard.welcomeBack')} <span className="gradient-text">{user.name}</span>
            </p>
          </div>
          <div className="dashboard-role-badge">{user.role === 'admin' ? t('dashboard.admin') : t('dashboard.user')}</div>
        </div>

        <div className="dashboard-grid">
          <div className="dash-card">
            <div className="dash-card-title">{t('dashboard.profile')}</div>
            <div className="profile-avatar-row">
              <div className="profile-avatar">{user.name.charAt(0).toUpperCase()}</div>
              <div>
                <div className="profile-name">{user.name}</div>
                <div className="profile-email">{user.email}</div>
              </div>
            </div>
            <p className="dashboard-sub">
              {t('dashboard.profileBlurb')}
            </p>
          </div>
        </div>
      </div>

    </main>
  );
}
