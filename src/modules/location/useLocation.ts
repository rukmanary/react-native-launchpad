import { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import type { GeoPosition } from 'react-native-geolocation-service';
import { useAppActive } from '@/shared/hooks/useAppActive';
import { watchLocation } from '@/modules/location/location';

export function useLocation(enabled: boolean) {
  const active = useAppActive();
  const focused = useIsFocused();
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!enabled || !active || !focused) return;

    let cancelled = false;
    let stop: (() => void) | undefined;

    void watchLocation(
      (value) => {
        if (!cancelled) setPosition(value);
      },
      (value) => {
        if (!cancelled) setError(value);
      },
    )
      .then((cleanup) => {
        if (cancelled) cleanup();
        else stop = cleanup;
      })
      .catch((value) => {
        if (!cancelled) setError(value);
      });
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [enabled, active, focused]);
  return { position, error };
}
