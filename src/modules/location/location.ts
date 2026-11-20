import Geolocation, { type GeoPosition, type GeoError } from 'react-native-geolocation-service';
import { ensurePermission } from '@/core/permissions/permissions';

export async function currentLocation() {
  if (!(await ensurePermission('location')).granted) throw new Error('Location permission denied');
  return new Promise<GeoPosition>((resolve, reject) =>
    Geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
    }),
  );
}

export async function watchLocation(
  onPosition: (value: GeoPosition) => void,
  onError: (error: GeoError) => void,
) {
  if (!(await ensurePermission('location')).granted) throw new Error('Location permission denied');

  const id = Geolocation.watchPosition(onPosition, onError, {
    enableHighAccuracy: true,
    distanceFilter: 20,
  });

  return () => Geolocation.clearWatch(id);
}
