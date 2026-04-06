'use client';

import { useEffect, useRef } from 'react';
import { useLocale } from '../context/LocaleContext';
import { useComposerMediaTools } from '../hooks/useComposerMediaTools';

/** All glyphs use 20×20 in a 24 viewBox for consistent sizing. */
const ICO = { w: 20, h: 20 };

const IcoMic = () => (
  <svg {...ICO} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
    <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z" />
    <path d="M19 11a7 7 0 0 1-14 0M12 18v3M8 22h8" />
  </svg>
);

const IcoHeadphones = () => (
  <svg {...ICO} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
    <path d="M3 18v-6a9 9 0 1 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1v-8h1a2 2 0 0 1 2 2v4ZM3 19a2 2 0 0 0 2 2h1v-8H5a2 2 0 0 0-2 2v4Z" />
  </svg>
);

const IcoUpload = () => (
  <svg {...ICO} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
  </svg>
);

const IcoVideo = () => (
  <svg {...ICO} viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="2" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M22 8v8l-6-4 6-4Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const IcoScreen = () => (
  <svg {...ICO} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden>
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
);

const IcoClip = () => (
  <svg {...ICO} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
    <path d="M21.44 11.05 12.25 20.24a5.47 5.47 0 0 1-7.75-7.75l9.19-9.19a3.67 3.67 0 0 1 5.18 5.18l-9.2 9.19a2.2 2.2 0 0 1-3.12-3.12l8.07-8.06" />
  </svg>
);

const IcoImage = () => (
  <svg {...ICO} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" stroke="none" />
    <path d="m21 15-4-4-6.5 6.5L7 14l-4 4" strokeLinecap="round" />
  </svg>
);

const IcoSparkle = () => (
  <svg {...ICO} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.22" />
  </svg>
);

/**
 * @param {{ variant?: 'nxc' | 'workbench', setText: function, textareaRef: import('react').RefObject }} props
 */
export default function ComposerMediaToolbar({ variant = 'nxc', setText, textareaRef }) {
  const { t } = useLocale();
  const videoRef = useRef(null);
  const media = useComposerMediaTools({ setText, textareaRef, t });

  const onVideoClick = () => {
    if (media.previewStream && media.captureKind === 'camera') {
      media.stopStream();
      return;
    }
    media.openCamera();
  };

  const onScreenClick = () => {
    if (media.previewStream && media.captureKind === 'screen') {
      media.stopStream();
      return;
    }
    media.openScreenShare();
  };

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !media.previewStream) return;
    el.srcObject = media.previewStream;
    el.play().catch(() => {});
    return () => {
      el.srcObject = null;
    };
  }, [media.previewStream]);

  const isWb = variant === 'workbench';
  const toolBtn = (id, active, onClick, title, tone, children) => (
    <button
      key={id}
      type="button"
      className={`cmt-tile cmt-tile--${tone}${active ? ' cmt-tile--active' : ''}`}
      title={title}
      aria-label={title}
      aria-pressed={active || undefined}
      onClick={onClick}
    >
      {children}
    </button>
  );

  const captureLabel =
    media.captureKind === 'screen' ? t('composer.screenOnShort') : t('composer.cameraOnShort');

  const openFiles = () => media.fileAnyRef.current?.click();

  return (
    <>
      <input
        ref={media.fileAnyRef}
        type="file"
        className="cmt-file-hidden"
        multiple
        onChange={media.onFilesPicked}
        aria-hidden
        tabIndex={-1}
      />
      <input
        ref={media.fileImageRef}
        type="file"
        className="cmt-file-hidden"
        accept="image/*"
        multiple
        onChange={media.onFilesPicked}
        aria-hidden
        tabIndex={-1}
      />
      <input
        ref={media.fileAudioRef}
        type="file"
        className="cmt-file-hidden"
        accept="audio/*"
        multiple
        onChange={media.onFilesPicked}
        aria-hidden
        tabIndex={-1}
      />

      <div
        className={`composer-media-toolbar composer-media-toolbar--${variant}`}
        role="toolbar"
        aria-label={t('composer.toolbarAria')}
      >
        {toolBtn('mic', media.listening, media.toggleVoiceTyping, t('composer.mic'), 'mic', <IcoMic />)}
        {toolBtn(
          'audio',
          false,
          () => media.fileAudioRef.current?.click(),
          t('composer.audio'),
          'headphones',
          <IcoHeadphones />
        )}
        {toolBtn('upload', false, openFiles, t('composer.upload'), 'upload', <IcoUpload />)}
        {toolBtn(
          'vid',
          !!media.previewStream && media.captureKind === 'camera',
          onVideoClick,
          t('composer.camera'),
          'video',
          <IcoVideo />
        )}
        {toolBtn(
          'scr',
          !!media.previewStream && media.captureKind === 'screen',
          onScreenClick,
          t('composer.screen'),
          'screen',
          <IcoScreen />
        )}
        {toolBtn('clip', false, openFiles, t('composer.attach'), 'clip', <IcoClip />)}
        {toolBtn('img', false, () => media.fileImageRef.current?.click(), t('composer.image'), 'image', <IcoImage />)}
        {toolBtn('sparkle', false, media.insertSparkle, t('composer.sparkle'), 'sparkle', <IcoSparkle />)}
      </div>

      {media.notice ? (
        <p className={`cmt-notice${isWb ? ' cmt-notice--wb' : ''}`} role="status">
          {media.notice}
        </p>
      ) : null}

      {media.previewStream ? (
        <div className="cmt-capture-pop" role="dialog" aria-modal="true" aria-label={t('composer.capturePreview')}>
          <video ref={videoRef} className="cmt-capture-video" autoPlay playsInline muted />
          <div className="cmt-capture-bar">
            <span className="cmt-capture-label">{captureLabel}</span>
            <button type="button" className="cmt-capture-stop" onClick={media.stopStream}>
              {t('composer.stopCapture')}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
