/** Navbar / UI locale ids — must match `messagesByLocale` keys in dictionaries.js */
export const UI_LANGUAGES = [
  { id: 'en', code: 'EN', region: 'US', label: 'English' },
  { id: 'ar', code: 'AR', region: 'SA', label: 'العربية' },
  { id: 'fr', code: 'FR', region: 'FR', label: 'Français' },
  { id: 'de', code: 'DE', region: 'DE', label: 'Deutsch' },
  { id: 'es', code: 'ES', region: 'ES', label: 'Español' },
  { id: 'pt', code: 'PT', region: 'BR', label: 'Português' },
  { id: 'zh', code: 'ZH', region: 'CN', label: '中文' },
  { id: 'ja', code: 'JA', region: 'JP', label: '日本語' },
  { id: 'ko', code: 'KO', region: 'KR', label: '한국어' },
];

export const RTL_LOCALES = new Set(['ar']);

export const HTML_LANG = {
  en: 'en',
  ar: 'ar',
  fr: 'fr',
  de: 'de',
  es: 'es',
  pt: 'pt-BR',
  zh: 'zh-Hans',
  ja: 'ja',
  ko: 'ko',
};
