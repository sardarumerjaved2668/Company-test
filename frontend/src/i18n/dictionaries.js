import { deepMerge } from './deepMerge';
import en from './messages/en.json';
import packAr from './packs/ar.json';
import packDe from './packs/de.json';
import packEs from './packs/es.json';
import packFr from './packs/fr.json';
import packJa from './packs/ja.json';
import packKo from './packs/ko.json';
import packPt from './packs/pt.json';
import packZh from './packs/zh.json';

const clone = (o) => JSON.parse(JSON.stringify(o));

/** @type {Record<string, typeof en>} */
export const messagesByLocale = {
  en,
  ar: deepMerge(clone(en), packAr),
  de: deepMerge(clone(en), packDe),
  es: deepMerge(clone(en), packEs),
  fr: deepMerge(clone(en), packFr),
  ja: deepMerge(clone(en), packJa),
  ko: deepMerge(clone(en), packKo),
  pt: deepMerge(clone(en), packPt),
  zh: deepMerge(clone(en), packZh),
};

export const DEFAULT_LOCALE = 'en';

export const SUPPORTED_LOCALES = Object.keys(messagesByLocale);

export function getMessages(locale) {
  return messagesByLocale[locale] || messagesByLocale.en;
}
