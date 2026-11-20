import notifyKit, { AndroidImportance, type Notification } from 'react-native-notify-kit';
import { Notifications } from 'react-native-notifications';
import { Platform } from 'react-native';
import { config } from '@/core/config/config';

export async function showNotification(notification: Notification) {
  await notifyKit.requestPermission();

  const channelId = await notifyKit.createChannel({
    id: 'default',
    name: 'General',
    importance: AndroidImportance.DEFAULT,
  });

  return notifyKit.displayNotification({
    ...notification,
    android: { channelId, smallIcon: 'ic_notification', ...notification.android },
  });
}

export const cancelNotification = (id: string) => notifyKit.cancelNotification(id);

export function observeNativeNotifications(onOpened: (data: Record<string, unknown>) => void) {
  const opened = Notifications.events().registerNotificationOpened((notification, completion) => {
    try {
      onOpened(notification.payload);
    } finally {
      completion();
    }
  });
  return () => opened.remove();
}

// Use one presentation owner: Notify Kit OR react-native-notifications, never both for the same event.
export function requestNativePushRegistration() {
  if (Platform.OS === 'android' && !config.services.firebase)
    throw new Error('Configure Firebase before registering Android remote notifications');
  return Notifications.registerRemoteNotifications();
}
