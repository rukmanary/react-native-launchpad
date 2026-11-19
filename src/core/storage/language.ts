import { preferences } from './preferences';

export type Language = 'en' | 'id';

export function readLanguage(): Language {
  return preferences.getString('language') === 'en' ? 'en' : 'id';
}
