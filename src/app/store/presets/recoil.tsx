import { type PropsWithChildren } from 'react';
import { atom, RecoilRoot, useRecoilState, useRecoilValue } from 'recoil';
import { readLanguage, type Language } from '@/core/storage/language';
import { useLanguageSync } from '@/app/store/useLanguageSync';

export const languageAtom = atom<Language>({
  key: 'starter/preferences/language',
  default: readLanguage(),
});

export function useAppLanguage() {
  const [language, setLanguage] = useRecoilState(languageAtom);
  return { language, setLanguage };
}

function SyncLanguage() {
  useLanguageSync(useRecoilValue(languageAtom));
  return null;
}

export function StateProvider({ children }: PropsWithChildren) {
  return (
    <RecoilRoot>
      <SyncLanguage />
      {children}
    </RecoilRoot>
  );
}
