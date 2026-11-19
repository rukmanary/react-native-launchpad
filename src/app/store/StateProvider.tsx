import { useEffect, type PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { preferences } from '../../core/storage/preferences';
import { i18n } from '../providers/i18n';
export function StateProvider({ children }: PropsWithChildren) {
  useEffect(
    () =>
      store.subscribe(() => {
        const language = store.getState().preferences.language;
        preferences.set('language', language);
        if (i18n.language !== language) void i18n.changeLanguage(language);
      }),
    [],
  );
  return <Provider store={store}>{children}</Provider>;
}
