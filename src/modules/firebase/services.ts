import { getApp } from '@react-native-firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from '@react-native-firebase/auth';
import {
  getAnalytics,
  logEvent,
  setAnalyticsCollectionEnabled,
} from '@react-native-firebase/analytics';
import {
  getCrashlytics,
  recordError,
  setCrashlyticsCollectionEnabled,
} from '@react-native-firebase/crashlytics';
import { getRemoteConfig, fetchAndActivate, getValue } from '@react-native-firebase/remote-config';
import { getPerformance, trace } from '@react-native-firebase/perf';
import { getDatabase, ref, onValue, set } from '@react-native-firebase/database';
import type { ZodType } from 'zod';
import { config } from '@/core/config/config';

function app() {
  if (!config.services.firebase)
    throw new Error('Enable Firebase after adding native registration files');
  return getApp();
}

export const firebaseSignIn = (email: string, password: string) =>
  signInWithEmailAndPassword(getAuth(app()), email, password);

export const firebaseSignOut = () => signOut(getAuth(app()));

export const observeFirebaseUser = (listener: (user: User | null) => void) =>
  onAuthStateChanged(getAuth(app()), listener);

export async function setTelemetryConsent(enabled: boolean) {
  getPerformance(app()).dataCollectionEnabled = enabled;
  await Promise.all([
    setAnalyticsCollectionEnabled(getAnalytics(app()), enabled),
    setCrashlyticsCollectionEnabled(getCrashlytics(app()), enabled),
  ]);
}

export async function trackEvent(
  name: string,
  parameters: Record<string, string | number | boolean> = {},
) {
  if (!/^[A-Za-z][A-Za-z0-9_]{0,39}$/.test(name)) throw new Error('Invalid analytics event name');
  await logEvent(getAnalytics(app()), name, parameters);
}

export const reportCrash = (error: Error) => recordError(getCrashlytics(app()), error);

export async function loadRemoteConfig(defaults: Record<string, string | number | boolean>) {
  const instance = getRemoteConfig(app());
  instance.defaultConfig = defaults;
  await fetchAndActivate(instance);
  return <T>(key: string, schema: ZodType<T>): T =>
    schema.parse(JSON.parse(getValue(instance, key).asString()));
}

export async function measureOperation<T>(name: string, operation: () => Promise<T>) {
  const metric = trace(getPerformance(app()), name);
  await metric.start();
  try {
    return await operation();
  } finally {
    await metric.stop();
  }
}

export function observeRecord<T>(
  path: string,
  schema: ZodType<T>,
  onData: (value: T) => void,
  onError: (error: Error) => void,
) {
  return onValue(
    ref(getDatabase(app()), path),
    (snapshot) => {
      const parsed = schema.safeParse(snapshot.val());
      if (parsed.success) onData(parsed.data);
      else onError(parsed.error);
    },
    onError,
  );
}

export async function writeRecord<T>(path: string, value: T, schema: ZodType<T>) {
  await set(ref(getDatabase(app()), path), schema.parse(value));
}
