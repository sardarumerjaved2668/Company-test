'use client';

import PropTypes from 'prop-types';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, getMessages } from '../i18n/dictionaries';
import { getByPath, interpolate } from '../i18n/getByPath';
import { HTML_LANG, RTL_LOCALES, UI_LANGUAGES } from '../i18n/locales';
import api from '../services/api';

const STORAGE_KEY = 'nexusai-locale';

const LocaleContext = createContext(null);

function readStoredLocale() {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v && SUPPORTED_LOCALES.includes(v) ? v : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);
  // Languages fetched from backend; fallback to static list
  const [languages, setLanguages] = useState(UI_LANGUAGES);
  // Ref to avoid double-syncing to backend on initial load
  const skipSyncRef = useRef(true);

  // Bootstrap: read from localStorage on client
  useEffect(() => {
    setLocaleState(readStoredLocale());
    setReady(true);
  }, []);

  // Fetch supported languages from backend
  useEffect(() => {
    api.get('/languages')
      .then(({ data }) => {
        if (data.success && Array.isArray(data.languages) && data.languages.length > 0) {
          setLanguages(data.languages);
        }
      })
      .catch(() => { /* keep static fallback */ });
  }, []);

  // Apply locale to DOM + localStorage
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch { /* ignore */ }
    const html = document.documentElement;
    html.lang = HTML_LANG[locale] || locale;
    html.dir = RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';
  }, [locale, ready]);

  // Sync locale to backend when authenticated user changes language
  useEffect(() => {
    if (!ready) return;
    if (skipSyncRef.current) {
      // Skip the very first render to avoid overwriting server-side language
      skipSyncRef.current = false;
      return;
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return;
    api.patch('/auth/language', { language: locale }).catch(() => { /* non-critical */ });
  }, [locale, ready]);

  const setLocale = useCallback((next) => {
    if (SUPPORTED_LOCALES.includes(next)) setLocaleState(next);
  }, []);

  // Apply language preference from backend session (called by AuthContext after login/session)
  const applyServerLocale = useCallback((lang) => {
    if (lang && SUPPORTED_LOCALES.includes(lang)) {
      skipSyncRef.current = true; // don't echo it back to server
      setLocaleState(lang);
    }
  }, []);

  const messages = useMemo(() => getMessages(locale), [locale]);

  const t = useCallback(
    (path, vars) => {
      const raw = getByPath(messages, path);
      if (raw == null) return path;
      return interpolate(raw, vars);
    },
    [messages]
  );

  const value = useMemo(
    () => ({ locale, setLocale, applyServerLocale, messages, t, ready, languages }),
    [locale, setLocale, applyServerLocale, messages, t, ready, languages]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

LocaleProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
