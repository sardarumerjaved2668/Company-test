'use client';

import PropTypes from 'prop-types';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, getMessages } from '../i18n/dictionaries';
import { getByPath, interpolate } from '../i18n/getByPath';
import { HTML_LANG, RTL_LOCALES } from '../i18n/locales';

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

  useEffect(() => {
    setLocaleState(readStoredLocale());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
    const html = document.documentElement;
    html.lang = HTML_LANG[locale] || locale;
    html.dir = RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';
  }, [locale, ready]);

  const setLocale = useCallback((next) => {
    if (SUPPORTED_LOCALES.includes(next)) setLocaleState(next);
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
    () => ({ locale, setLocale, messages, t, ready }),
    [locale, setLocale, messages, t, ready]
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
