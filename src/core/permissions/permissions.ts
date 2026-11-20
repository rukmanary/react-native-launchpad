import { AppState, Platform } from 'react-native';
import {
  check,
  request,
  openSettings,
  PERMISSIONS,
  RESULTS,
  type Permission,
} from 'react-native-permissions';

const permissions = {
  camera: Platform.select({ ios: PERMISSIONS.IOS.CAMERA, default: PERMISSIONS.ANDROID.CAMERA }),
  microphone: Platform.select({
    ios: PERMISSIONS.IOS.MICROPHONE,
    default: PERMISSIONS.ANDROID.RECORD_AUDIO,
  }),
  location: Platform.select({
    ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    default: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  }),
  photos: Platform.select({
    ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
    default: PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
  }),
} satisfies Record<string, Permission>;

export async function ensurePermission(capability: keyof typeof permissions) {
  const permission = permissions[capability];
  let status = await check(permission);

  if (status === RESULTS.DENIED) status = await request(permission);

  return {
    status,
    granted: status === RESULTS.GRANTED || status === RESULTS.LIMITED,
    openSettings: () => openSettings('application'),
  };
}

export function observePermission(
  capability: keyof typeof permissions,
  onChange: (granted: boolean) => void,
) {
  const subscription = AppState.addEventListener('change', (state) => {
    if (state === 'active')
      void check(permissions[capability]).then((status) =>
        onChange(status === RESULTS.GRANTED || status === RESULTS.LIMITED),
      );
  });
  return () => subscription.remove();
}
