import {
  getMessaging,
  setBackgroundMessageHandler,
  type RemoteMessage,
} from '@react-native-firebase/messaging';
export function registerBackgroundMessaging(
  handler: (message: RemoteMessage) => Promise<void> = async () => {},
) {
  setBackgroundMessageHandler(getMessaging(), handler);
}
