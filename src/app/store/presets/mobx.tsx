import { useSyncExternalStore, type PropsWithChildren } from 'react';
import { action, observable, reaction } from 'mobx';
import { readLanguage, type Language } from '@/core/storage/language';
import { useLanguageSync } from '@/app/store/useLanguageSync';

const store = observable({ language: readLanguage() });

const readSnapshot = () => store.language;

const subscribe = (notify: () => void) => reaction(readSnapshot, notify);

const setLanguage = action((language: Language) => {
  store.language = language;
});

export function useAppLanguage() {
  const language = useSyncExternalStore(subscribe, readSnapshot);
  return { language, setLanguage };
}

export function StateProvider({ children }: PropsWithChildren) {
  useLanguageSync(useAppLanguage().language);
  return children;
}
