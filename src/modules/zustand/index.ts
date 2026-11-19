import { create } from 'zustand';
import { preferences } from '../../core/storage/preferences';
export const usePreferences = create<{
  language: 'id' | 'en';
  setLanguage: (language: 'id' | 'en') => void;
}>((set) => ({
  language: preferences.getString('language') === 'en' ? 'en' : 'id',
  setLanguage: (language) => {
    preferences.set('language', language);
    set({ language });
  },
}));
