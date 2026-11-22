import type { Ref } from 'react';
import { useIsFocused } from '@react-navigation/native';
import MapView, { Marker, type MapViewProps } from 'react-native-maps';
import { useAppActive } from '@/shared/hooks/useAppActive';
import { useTheme } from '@/shared/theme/theme';

export const AppMap = ({
  markers = [],
  children,
  ref,
  ...props
}: MapViewProps & {
  markers?: ReadonlyArray<{ id: string; latitude: number; longitude: number; title: string }>;
  ref?: Ref<MapView>;
}) => {
  const focused = useIsFocused();
  const active = useAppActive();
  const { colors, mode } = useTheme();

  return (
    <MapView
      {...props}
      ref={ref}
      userInterfaceStyle={props.userInterfaceStyle ?? mode}
      showsUserLocation={Boolean(props.showsUserLocation && focused && active)}
    >
      {children}
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={marker}
          title={marker.title}
          pinColor={colors.primary}
        />
      ))}
    </MapView>
  );
};
