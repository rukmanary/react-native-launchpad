import {
  getMessaging,
  setAutoInitEnabled,
  getToken,
  onMessage,
  onTokenRefresh,
  onNotificationOpenedApp,
  getInitialNotification,
  requestPermission,
  type RemoteMessage,
} from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { requestNotifications, RESULTS } from 'react-native-permissions';
export async function registerPush() {
  if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
    if ((await requestNotifications(['alert', 'sound', 'badge'])).status !== RESULTS.GRANTED)
      return null;
  } else if (Platform.OS === 'ios') {
    const status = await requestPermission(getMessaging());
    if (status < 1) return null;
  }
  await setAutoInitEnabled(getMessaging(), true);
  return getToken(getMessaging());
}
export function observePush({
  onForeground,
  onOpen,
  onToken,
  onError,
}: {
  onForeground: (message: RemoteMessage) => void;
  onOpen: (message: RemoteMessage) => void;
  onToken: (token: string) => void;
  onError: (error: unknown) => void;
}) {
  let disposed = false;
  const seen = new Set<string>();
  const open = (message: RemoteMessage) => {
    if (disposed) return;
    if (message.messageId) {
      if (seen.has(message.messageId)) return;
      if (seen.size > 100) seen.clear();
      seen.add(message.messageId);
    }
    onOpen(message);
  };
  const stop = [
    onMessage(getMessaging(), onForeground),
    onTokenRefresh(getMessaging(), onToken),
    onNotificationOpenedApp(getMessaging(), open),
  ];
  void getInitialNotification(getMessaging())
    .then((message) => {
      if (message) open(message);
    })
    .catch(onError);
  return () => {
    disposed = true;
    stop.forEach((unsubscribe) => unsubscribe());
  };
}
