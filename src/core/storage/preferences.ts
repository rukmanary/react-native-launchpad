import { createMMKV } from 'react-native-mmkv';
import { config } from '../config/config';
export const preferences = createMMKV({ id: config.slug + '.preferences.v1' });
export function readPreference<T>(key: string, parse: (value: unknown) => T, fallback: T): T {
  const raw = preferences.getString(key);
  if (raw === undefined) return fallback;
  try {
    return parse(JSON.parse(raw));
  } catch {
    preferences.remove(key);
    return fallback;
  }
}
