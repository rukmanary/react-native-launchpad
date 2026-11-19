import { type PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { setLanguage, store, useAppDispatch, useAppSelector } from '../store';
import { useLanguageSync } from '../useLanguageSync';
import type { Language } from '../../../core/storage/language';

export function useAppLanguage() {
  const language = useAppSelector((state) => state.preferences.language);
  const dispatch = useAppDispatch();
  return { language, setLanguage: (next: Language) => dispatch(setLanguage(next)) };
}

function SyncLanguage() {
  useLanguageSync(useAppLanguage().language);
  return null;
}

export function StateProvider({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <SyncLanguage />
      {children}
    </Provider>
  );
}
