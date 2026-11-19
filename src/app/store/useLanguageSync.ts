import { useEffect } from 'react';
import { preferences } from '../../core/storage/preferences';
import type { Language } from '../../core/storage/language';
import { i18n } from '../providers/i18n';

export function useLanguageSync(language: Language) {
  useEffect(() => {
    if (preferences.getString('language') !== language) preferences.set('language', language);
    if (i18n.language !== language) void i18n.changeLanguage(language);
  }, [language]);
}
