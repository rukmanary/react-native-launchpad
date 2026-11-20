import { create } from 'zustand';
import { readLanguage, type Language } from '@/core/storage/language';

export const usePreferences = create<{
  language: Language;
  setLanguage: (language: Language) => void;
}>((set) => ({
  language: readLanguage(),
  setLanguage: (language) => set({ language }),
}));
