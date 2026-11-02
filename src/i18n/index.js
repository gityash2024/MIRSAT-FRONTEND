import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from '../locales/en.json';
import arTranslation from '../locales/ar.json';
import maintenanceEn from '../locales/maintenance.en.json';
import maintenanceAr from '../locales/maintenance.ar.json';

const resources = {
  en: {
    translation: enTranslation,
    maintenance: maintenanceEn
  },
  ar: {
    translation: arTranslation,
    maintenance: maintenanceAr
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    },
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });
export default i18n;
