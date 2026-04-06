'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Voice typing, uploads, camera, and screen capture for composer text fields.
 * Browser APIs: SpeechRecognition, getUserMedia, getDisplayMedia (best in Chrome/Edge).
 */
export function useComposerMediaTools({ setText, textareaRef, t }) {
  const [listening, setListening] = useState(false);
  const [previewStream, setPreviewStream] = useState(null);
  const [captureKind, setCaptureKind] = useState(null);
  const [notice, setNotice] = useState('');

  const recognitionRef = useRef(null);
  const fileAnyRef = useRef(null);
  const fileImageRef = useRef(null);
  const fileAudioRef = useRef(null);

  const stopStream = useCallback(() => {
    setPreviewStream((prev) => {
      if (prev) prev.getTracks().forEach((tr) => tr.stop());
      return null;
    });
    setCaptureKind(null);
  }, []);

  useEffect(() => () => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
  }, []);

  const appendLine = useCallback(
    (line) => {
      setText((prev) => (prev ? `${prev}\n${line}` : line));
    },
    [setText]
  );

  const toggleVoiceTyping = useCallback(() => {
    const SR = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
    if (!SR) {
      setNotice(t('composer.unsupportedVoice'));
      return;
    }
    if (listening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const piece = event.results[i][0].transcript;
          if (piece) setText((prev) => prev + piece);
        }
      }
    };
    rec.onerror = () => {
      setListening(false);
      setNotice(t('composer.voiceError'));
    };
    rec.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };
    try {
      rec.start();
      recognitionRef.current = rec;
      setListening(true);
      setNotice('');
    } catch {
      setNotice(t('composer.voiceError'));
    }
  }, [listening, setText, t]);

  const onFilesPicked = useCallback(
    (e) => {
      const files = [...(e.target.files || [])];
      e.target.value = '';
      if (!files.length) return;
      const names = files.map((f) => f.name).join(', ');
      appendLine(`[Attached: ${names}]`);
      setNotice(t('composer.attached', { names }));
    },
    [appendLine, t]
  );

  const openCamera = useCallback(async () => {
    stopStream();
    if (!navigator.mediaDevices?.getUserMedia) {
      setNotice(t('composer.unsupportedCamera'));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setPreviewStream(stream);
      setCaptureKind('camera');
      setNotice(t('composer.cameraOn'));
    } catch {
      setNotice(t('composer.cameraDenied'));
    }
  }, [stopStream, t]);

  const openScreenShare = useCallback(async () => {
    stopStream();
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setNotice(t('composer.unsupportedScreen'));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      const [track] = stream.getVideoTracks();
      if (track) {
        track.onended = () => {
          stopStream();
          setNotice(t('composer.screenEnded'));
        };
      }
      setPreviewStream(stream);
      setCaptureKind('screen');
      appendLine('[Screen share active — add your question below.]');
      setNotice(t('composer.screenOn'));
    } catch {
      setNotice(t('composer.screenDenied'));
    }
  }, [appendLine, stopStream, t]);

  const insertSparkle = useCallback(() => {
    setText((prev) => {
      const base = prev?.trim() ? `${prev}\n\n` : '';
      return `${base}${t('composer.sparklePrefix')}`;
    });
    globalThis.requestAnimationFrame(() => textareaRef.current?.focus());
  }, [setText, t, textareaRef]);

  return {
    listening,
    captureKind,
    previewStream,
    notice,
    setNotice,
    stopStream,
    toggleVoiceTyping,
    openCamera,
    openScreenShare,
    insertSparkle,
    fileAnyRef,
    fileImageRef,
    fileAudioRef,
    onFilesPicked,
  };
}
