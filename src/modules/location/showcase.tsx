import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import type MapView from 'react-native-maps';
import { config } from '@/core/config/config';
import { AppMap } from '@/modules/location/AppMap';
import { currentLocation } from '@/modules/location/location';
import { useTheme } from '@/shared/theme/theme';
import { AppText } from '@/shared/ui/AppText';
import { Button } from '@/shared/ui/Button';
import { Screen } from '@/shared/ui/Screen';

const monas = { id: 'monas', latitude: -6.1754, longitude: 106.8272, title: 'National Monument' };
const initialRegion = {
  latitude: monas.latitude,
  longitude: monas.longitude,
  latitudeDelta: 0.035,
  longitudeDelta: 0.035,
};

const markers = [monas];

export const LocationShowcaseScreen = () => {
  const { colors, radii, spacing } = useTheme();
  const map = useRef<MapView>(null);
  const mounted = useRef(true);
  const locating = useRef(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('The sample pin marks Jakarta’s National Monument.');
  const [hasLocation, setHasLocation] = useState(false);
  const hasMapProvider = Platform.OS !== 'android' || Boolean(config.services.mapsAndroidKey);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  const locate = async () => {
    if (locating.current) return;

    locating.current = true;
    setBusy(true);

    try {
      const { coords } = await currentLocation();
      if (!mounted.current) return;

      setHasLocation(true);
      setMessage('Your location is shown on this map.');
      map.current?.animateToRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    } catch {
      if (mounted.current)
        setMessage('Location is unavailable. Check permission and device settings.');
    } finally {
      locating.current = false;
      if (mounted.current) setBusy(false);
    }
  };

  return (
    <Screen style={{ padding: spacing.lg, gap: spacing.md }}>
      <AppText variant="heading">Maps and location</AppText>
      {hasMapProvider ? (
        <View
          style={[styles.map, { borderRadius: radii.lg, backgroundColor: colors.surfaceMuted }]}
        >
          <AppMap
            ref={map}
            accessibilityLabel="Interactive map of Jakarta"
            style={StyleSheet.absoluteFill}
            initialRegion={initialRegion}
            markers={markers}
            showsUserLocation={hasLocation}
          />
        </View>
      ) : (
        <View
          style={{
            padding: spacing.md,
            borderRadius: radii.lg,
            backgroundColor: colors.surfaceMuted,
          }}
        >
          <AppText>National Monument, Jakarta</AppText>
          <AppText tone="muted">6.1754° S, 106.8272° E</AppText>
          <AppText tone="muted">
            Configure Maps SDK for Android for the active flavor, then rebuild to load map tiles.
          </AppText>
        </View>
      )}
      {hasMapProvider && (
        <>
          <AppText accessibilityLiveRegion="polite" tone="muted">
            {message}
          </AppText>
          <Button label="Find my location" loading={busy} onPress={() => void locate()} />
        </>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  map: { flex: 1, minHeight: 180, overflow: 'hidden' },
});
