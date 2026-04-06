'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from '../context/LocaleContext';

const TOTAL_STEPS = 6;

function validName(s) {
  return s.trim().length >= 2;
}
function validPurpose(s) {
  return s.trim().length >= 4;
}
function validSystem(s) {
  return s.trim().length >= 8;
}

function validationMessage(step, t, agentName, purpose, systemPrompt) {
  if (step === 1) {
    if (!validName(agentName)) return t('workbench.modal.errorName');
    if (!validPurpose(purpose)) return t('workbench.modal.errorPurpose');
  }
  if (step === 2 && !validSystem(systemPrompt)) return t('workbench.modal.errorSystem');
  return null;
}

/**
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   mode: 'template' | 'scratch',
 *   systemAgent: object | null,
 *   display: { title: string, description: string, tags: string[] },
 *   onSave: (payload: object) => Promise<void>,
 * }} props
 */
export default function AgentTemplateModal({
  open,
  onClose,
  mode,
  systemAgent,
  display,
  onSave,
}) {
  const { t } = useLocale();
  const [currentStep, setCurrentStep] = useState(1);
  const [agentName, setAgentName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const model = systemAgent?.model || 'GPT-4o';
  const icon = systemAgent?.icon || '🤖';
  const templateId = mode === 'scratch' ? '' : systemAgent?.templateId || '';
  const tags = display?.tags?.length ? display.tags : systemAgent?.tags || [];

  const stepperLabels = useMemo(
    () => [
      t('workbench.modal.stepper1'),
      t('workbench.modal.stepper2'),
      t('workbench.modal.stepper3'),
      t('workbench.modal.stepper4'),
      t('workbench.modal.stepper5'),
      t('workbench.modal.stepper6'),
    ],
    [t]
  );

  /** Modal title bar — matches Netlify wizard step names */
  const headerTitles = useMemo(
    () => [
      t('workbench.modal.headerStep1'),
      t('workbench.modal.headerStep2'),
      t('workbench.modal.headerStep3'),
      t('workbench.modal.headerStep4'),
      t('workbench.modal.headerStep5'),
      t('workbench.modal.headerStep6'),
    ],
    [t]
  );

  /**
   * Initialise the wizard only when the modal opens or the template/mode identity changes.
   * Do NOT depend on `display` by reference — the parent passes a new object every render,
   * which was resetting name/purpose while the user typed and broke validation.
   */
  useEffect(() => {
    if (!open) return;
    setCurrentStep(1);
    setSaveError('');
    const desc = (display?.description || systemAgent?.description || '').trim();
    setPurpose(desc);
    setSystemPrompt('');
    if (mode === 'scratch') {
      setAgentName('');
    } else {
      setAgentName((display?.title || systemAgent?.title || '').trim());
    }
  }, [
    open,
    mode,
    systemAgent?.templateId,
    systemAgent?._id,
    systemAgent?.title,
    systemAgent?.description,
    display?.title,
    display?.description,
  ]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const canAdvance = (step) => {
    if (step === 1) return validName(agentName) && validPurpose(purpose);
    if (step === 2) return validSystem(systemPrompt);
    return true;
  };

  const nextDisabled = !canAdvance(currentStep) || saving;

  const handleNext = () => {
    if (currentStep >= TOTAL_STEPS || nextDisabled) return;
    setSaveError('');
    setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (currentStep <= 1) return;
    setSaveError('');
    setCurrentStep((s) => s - 1);
  };

  const handleSave = async () => {
    if (!canAdvance(1) || !canAdvance(2)) return;
    setSaving(true);
    setSaveError('');
    try {
      await onSave({
        name: agentName.trim().slice(0, 80),
        templateId,
        purpose: purpose.trim(),
        systemPrompt: systemPrompt.trim(),
        model: String(model || '').trim() || 'GPT-4o',
        tags,
        icon,
      });
      onClose();
    } catch (e) {
      setSaveError(e?.message || t('workbench.modal.errorSaveGeneric'));
    } finally {
      setSaving(false);
    }
  };

  const errMsg = validationMessage(currentStep, t, agentName, purpose, systemPrompt);

  if (!open) return null;

  const headerTitle = headerTitles[currentStep - 1];
  const headerSub = t('workbench.modal.stepSubOf', { current: currentStep, total: TOTAL_STEPS });

  return (
    <div className="atm-overlay" role="dialog" aria-modal="true" aria-labelledby="atm-title">
      <button type="button" className="atm-backdrop" aria-label={t('workbench.modal.close')} onClick={onClose} />
      <div className="atm-panel atm-panel--wizard atm-panel--wide">
        <header className="atm-header">
          <div className="atm-header-icon atm-header-icon--netlify" aria-hidden>
            <span className="atm-header-diamond">✦</span>
          </div>
          <div className="atm-header-titles">
            <h2 id="atm-title" className="atm-title">
              {headerTitle}
            </h2>
            <p className="atm-sub">{headerSub}</p>
          </div>
          <button type="button" className="atm-x" onClick={onClose} aria-label={t('workbench.modal.close')}>
            ×
          </button>
        </header>

        <nav className="atm-stepper" aria-label="Agent setup progress">
          {stepperLabels.map((label, i) => {
            const num = i + 1;
            const done = currentStep > num;
            const active = currentStep === num;
            const circleClass = done
              ? ' atm-stepper-circle--done'
              : active
                ? ' atm-stepper-circle--active'
                : ' atm-stepper-circle--todo';
            const textClass = [
              'atm-stepper-text',
              done ? 'atm-stepper-text--done' : '',
              active ? 'atm-stepper-text--current' : '',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <div key={num} className="atm-stepper-item">
                {i > 0 ? (
                  <span
                    className={`atm-stepper-line${currentStep > i ? ' atm-stepper-line--warm' : ''}`}
                    aria-hidden
                  />
                ) : null}
                <div className="atm-stepper-col">
                  <span className={`atm-stepper-circle${circleClass}`}>{done ? '✓' : num}</span>
                  <span className={textClass}>{label}</span>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="atm-wizard">
          <p className="atm-step-kicker">{t('workbench.modal.stepIndicator', { current: currentStep, total: TOTAL_STEPS })}</p>

          {currentStep === 1 && (
            <div className="atm-step-block">
              <h3 className="atm-step-question">{t('workbench.modal.stepNameQuestion')}</h3>
              <input
                type="text"
                className="atm-input atm-input--spaced"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder={t('workbench.modal.placeholderName')}
                maxLength={120}
                autoComplete="off"
                aria-required
              />
              <h3 className="atm-step-question atm-step-question--secondary">{t('workbench.modal.step1')}</h3>
              {mode === 'template' ? <p className="atm-help">{t('workbench.modal.step1Help')}</p> : null}
              <textarea
                className="atm-textarea"
                rows={5}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder={t('workbench.modal.placeholderPurpose')}
                aria-required
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="atm-step-block">
              <h3 className="atm-step-question">{t('workbench.modal.step2')}</h3>
              <textarea
                className="atm-textarea"
                rows={6}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder={t('workbench.modal.placeholderSystem')}
                aria-required
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="atm-step-block">
              <h3 className="atm-step-question">{t('workbench.modal.step3')}</h3>
              <p className="atm-step-lead">{t('workbench.modal.toolsIntro')}</p>
              <div className="atm-soft-panel">
                <p className="atm-placeholder">{t('workbench.modal.toolsPlaceholder')}</p>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="atm-step-block">
              <h3 className="atm-step-question">{t('workbench.modal.step4')}</h3>
              <p className="atm-step-lead">{t('workbench.modal.memoryIntro')}</p>
              <div className="atm-soft-panel">
                <p className="atm-placeholder">{t('workbench.modal.memoryPlaceholder')}</p>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="atm-step-block">
              <h3 className="atm-step-question">{t('workbench.modal.step5')}</h3>
              <p className="atm-step-lead">{t('workbench.modal.testIntro')}</p>
              <div className="atm-soft-panel">
                <p className="atm-placeholder">{t('workbench.modal.testPlaceholder')}</p>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="atm-step-block atm-step-block--deploy">
              <p className="atm-deploy-intro">{t('workbench.modal.deployIntro')}</p>
              <div className="atm-deploy-grid">
                <article className="atm-deploy-card">
                  <span className="atm-deploy-card-ico" aria-hidden>
                    🔗
                  </span>
                  <h4 className="atm-deploy-card-title">{t('workbench.modal.deployCard1Title')}</h4>
                  <p className="atm-deploy-card-desc">{t('workbench.modal.deployCard1Desc')}</p>
                  <span className="atm-deploy-badge">{t('workbench.modal.deployCard1Badge')}</span>
                </article>
                <article className="atm-deploy-card">
                  <span className="atm-deploy-card-ico" aria-hidden>
                    💬
                  </span>
                  <h4 className="atm-deploy-card-title">{t('workbench.modal.deployCard2Title')}</h4>
                  <p className="atm-deploy-card-desc">{t('workbench.modal.deployCard2Desc')}</p>
                  <span className="atm-deploy-badge">{t('workbench.modal.deployCard2Badge')}</span>
                </article>
                <article className="atm-deploy-card">
                  <span className="atm-deploy-card-ico" aria-hidden>
                    🤖
                  </span>
                  <h4 className="atm-deploy-card-title">{t('workbench.modal.deployCard3Title')}</h4>
                  <p className="atm-deploy-card-desc">{t('workbench.modal.deployCard3Desc')}</p>
                  <span className="atm-deploy-badge">{t('workbench.modal.deployCard3Badge')}</span>
                </article>
                <article className="atm-deploy-card">
                  <span className="atm-deploy-card-ico" aria-hidden>
                    📱
                  </span>
                  <h4 className="atm-deploy-card-title">{t('workbench.modal.deployCard4Title')}</h4>
                  <p className="atm-deploy-card-desc">{t('workbench.modal.deployCard4Desc')}</p>
                  <span className="atm-deploy-badge">{t('workbench.modal.deployCard4Badge')}</span>
                </article>
              </div>
              <div className="atm-metrics">
                <div className="atm-metrics-hd">{t('workbench.modal.metricsTitle')}</div>
                <div className="atm-metrics-grid">
                  <div className="atm-metric-cell">
                    <span className="atm-metric-val">↑ 94%</span>
                    <span className="atm-metric-lbl">Response Quality</span>
                  </div>
                  <div className="atm-metric-cell">
                    <span className="atm-metric-val">1.2s</span>
                    <span className="atm-metric-lbl">Avg Latency</span>
                  </div>
                  <div className="atm-metric-cell">
                    <span className="atm-metric-val">12.4K/day</span>
                    <span className="atm-metric-lbl">Token Usage</span>
                  </div>
                  <div className="atm-metric-cell">
                    <span className="atm-metric-val">4.7 ⭐</span>
                    <span className="atm-metric-lbl">Satisfaction</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {errMsg ? (
            <p className="atm-field-error" role="alert">
              {errMsg}
            </p>
          ) : null}
          {saveError ? (
            <p className="atm-field-error" role="alert">
              {saveError}
            </p>
          ) : null}
        </div>

        <footer className="atm-footer atm-footer--netlify">
          <button
            type="button"
            className="atm-btn atm-btn--outline"
            onClick={currentStep === 1 ? onClose : handleBack}
          >
            {currentStep === 1 ? t('workbench.modal.cancel') : `← ${t('workbench.modal.back')}`}
          </button>

          <div className="atm-dots" aria-hidden>
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <span key={i} className={`atm-dot${i + 1 === currentStep ? ' atm-dot--on' : ''}`} />
            ))}
          </div>

          <div className="atm-footer-actions">
            {currentStep < TOTAL_STEPS ? (
              <button type="button" className="atm-btn atm-btn--primary" onClick={handleNext} disabled={nextDisabled}>
                {t('workbench.modal.next')}
              </button>
            ) : (
              <button
                type="button"
                className="atm-btn atm-btn--primary atm-btn--finish"
                onClick={handleSave}
                disabled={saving || !validName(agentName) || !validPurpose(purpose) || !validSystem(systemPrompt)}
              >
                {saving ? '…' : t('workbench.modal.finish')}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
