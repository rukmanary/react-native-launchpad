import { useEffect, type PropsWithChildren } from 'react';
import { usePreferences } from '../../modules/zustand';
import { i18n } from '../providers/i18n';
export function StateProvider({ children }: PropsWithChildren) {
  useEffect(
    () =>
      usePreferences.subscribe(({ language }) => {
        if (i18n.language !== language) void i18n.changeLanguage(language);
      }),
    [],
  );
  return children;
}
