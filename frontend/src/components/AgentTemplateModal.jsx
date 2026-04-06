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

function validationHintForStep(step, t) {
  if (step === 1) return t('workbench.modal.errorName');
  if (step === 2) return t('workbench.modal.errorPurpose');
  return t('workbench.modal.errorSystem');
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

  const title = mode === 'scratch' ? 'Custom Agent' : display?.title || systemAgent?.title || 'Agent';
  const model = systemAgent?.model || 'GPT-4o';
  const icon = systemAgent?.icon || '🤖';
  const templateId = mode === 'scratch' ? '' : systemAgent?.templateId || '';
  const tags = display?.tags?.length ? display.tags : systemAgent?.tags || [];

  const stepHeading = useMemo(() => {
    if (currentStep === 1) return t('workbench.modal.stepNameQuestion');
    if (currentStep === 2) return t('workbench.modal.step1');
    if (currentStep === 3) return t('workbench.modal.step2');
    if (currentStep === 4) return t('workbench.modal.step3');
    if (currentStep === 5) return t('workbench.modal.step4');
    return t('workbench.modal.step6');
  }, [currentStep, t]);

  useEffect(() => {
    if (!open) return;
    setCurrentStep(1);
    const desc = display?.description || systemAgent?.description || '';
    setPurpose(desc);
    setSystemPrompt('');
    if (mode === 'scratch') {
      setAgentName('');
    } else {
      setAgentName((display?.title || systemAgent?.title || '').trim());
    }
  }, [open, display, systemAgent, mode]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const canAdvance = (step) => {
    if (step === 1) return validName(agentName);
    if (step === 2) return validPurpose(purpose);
    if (step === 3) return validSystem(systemPrompt);
    return true;
  };

  const nextDisabled = !canAdvance(currentStep) || saving;

  const handleNext = () => {
    if (currentStep >= TOTAL_STEPS || nextDisabled) return;
    setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (currentStep <= 1) return;
    setCurrentStep((s) => s - 1);
  };

  const handleSave = async () => {
    if (!canAdvance(1) || !canAdvance(2) || !canAdvance(3)) return;
    setSaving(true);
    try {
      await onSave({
        name: agentName.trim().slice(0, 80),
        templateId,
        purpose: purpose.trim(),
        systemPrompt: systemPrompt.trim(),
        model,
        tags,
        icon,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="atm-overlay" role="dialog" aria-modal="true" aria-labelledby="atm-title">
      <button type="button" className="atm-backdrop" aria-label={t('workbench.modal.close')} onClick={onClose} />
      <div className="atm-panel atm-panel--wizard">
        <header className="atm-header">
          <div className="atm-header-icon">{icon}</div>
          <div>
            <h2 id="atm-title" className="atm-title">
              {title}
            </h2>
            <p className="atm-sub">
              {mode === 'scratch' ? t('workbench.modal.scratchSubtitle') : t('workbench.modal.subtitle')}
            </p>
          </div>
          <button type="button" className="atm-x" onClick={onClose} aria-label={t('workbench.modal.close')}>
            ×
          </button>
        </header>

        <div className="atm-banner">
          <span className="atm-banner-ico">ℹ️</span>
          <div>
            <div className="atm-banner-title">{t('workbench.modal.bannerTitle')}</div>
            <p className="atm-banner-text">{t('workbench.modal.bannerBody')}</p>
            <p className="atm-banner-model">
              {t('workbench.modal.recommended')} <strong>{model}</strong>
            </p>
          </div>
        </div>

        <div className="atm-wizard">
          <p className="atm-step-indicator">
            {t('workbench.modal.stepIndicator', { current: currentStep, total: TOTAL_STEPS })}
          </p>
          <h3 className="atm-step-question">{stepHeading}</h3>

          {currentStep === 1 && (
            <input
              type="text"
              className="atm-input"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder={t('workbench.modal.placeholderName')}
              maxLength={120}
              autoComplete="off"
              aria-invalid={!validName(agentName)}
              aria-required
            />
          )}

          {currentStep === 2 && (
            <>
              {mode === 'template' ? <p className="atm-help">{t('workbench.modal.step1Help')}</p> : null}
              <textarea
                className="atm-textarea"
                rows={6}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder={t('workbench.modal.placeholderPurpose')}
                aria-invalid={!validPurpose(purpose)}
                aria-required
              />
            </>
          )}

          {currentStep === 3 && (
            <textarea
              className="atm-textarea"
              rows={6}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder={t('workbench.modal.placeholderSystem')}
              aria-invalid={!validSystem(systemPrompt)}
              aria-required
            />
          )}

          {currentStep > 3 && (
            <p className="atm-placeholder">{t('workbench.modal.stepLaterPlaceholder')}</p>
          )}

          {currentStep <= 3 && !canAdvance(currentStep) ? (
            <p className="atm-field-error" role="alert">
              {validationHintForStep(currentStep, t)}
            </p>
          ) : null}
        </div>

        <footer className="atm-footer atm-footer--split">
          <button type="button" className="atm-btn atm-btn--ghost" onClick={onClose}>
            {t('workbench.modal.cancel')}
          </button>
          <div className="atm-footer-actions">
            {currentStep > 1 ? (
              <button type="button" className="atm-btn atm-btn--ghost" onClick={handleBack}>
                {t('workbench.modal.back')}
              </button>
            ) : null}
            {currentStep < TOTAL_STEPS ? (
              <button
                type="button"
                className="atm-btn atm-btn--primary"
                onClick={handleNext}
                disabled={nextDisabled}
              >
                {t('workbench.modal.next')}
              </button>
            ) : (
              <button
                type="button"
                className="atm-btn atm-btn--primary"
                onClick={handleSave}
                disabled={
                  saving ||
                  !validName(agentName) ||
                  !validPurpose(purpose) ||
                  !validSystem(systemPrompt)
                }
              >
                {saving ? '…' : t('workbench.modal.save')}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
