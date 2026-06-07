import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import ar from '../../locales/ar.json';
import en from '../../locales/en.json';

const STORAGE_KEY = 'erp_locale';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { ar: { translation: ar }, en: { translation: en } },
    fallbackLng: 'ar',
    lng: localStorage.getItem(STORAGE_KEY) ?? 'ar',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: STORAGE_KEY,
    },
  });

i18n.on('languageChanged', (lng) => {
  localStorage.setItem(STORAGE_KEY, lng);
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

if (typeof document !== 'undefined') {
  document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = i18n.language;
}

export default i18n;
