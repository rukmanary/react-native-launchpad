import { type PropsWithChildren } from 'react';
import { usePreferences } from '@/modules/zustand';
import { useLanguageSync } from '@/app/store/useLanguageSync';

export function useAppLanguage() {
  const language = usePreferences((state) => state.language);
  const setLanguage = usePreferences((state) => state.setLanguage);
  return { language, setLanguage };
}

export function StateProvider({ children }: PropsWithChildren) {
  useLanguageSync(usePreferences((state) => state.language));
  return children;
}
