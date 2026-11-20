import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { readLanguage } from '@/core/storage/language';
import { config } from '@/core/config/config';

void i18n.use(initReactI18next).init({
  lng: readLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  resources: {
    id: {
      translation: {
        welcome: config.displayName,
        description: 'Fondasi modular untuk proyek berikutnya',
        form: 'Contoh formulir',
        catalog: 'Contoh data API',
      },
    },
    en: {
      translation: {
        welcome: config.displayName,
        description: 'A modular foundation for your next project',
        form: 'Form example',
        catalog: 'API data example',
      },
    },
  },
});

export { i18n };
