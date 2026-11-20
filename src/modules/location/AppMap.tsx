import { useIsFocused } from '@react-navigation/native';
import MapView, { Marker, type MapViewProps } from 'react-native-maps';
import { useAppActive } from '../../shared/hooks/useAppActive';

export function AppMap({
  markers = [],
  ...props
}: MapViewProps & {
  markers?: Array<{ id: string; latitude: number; longitude: number; title: string }>;
}) {
  const focused = useIsFocused();
  const active = useAppActive();

  return (
    <MapView {...props} showsUserLocation={Boolean(props.showsUserLocation && focused && active)}>
      {markers.map((marker) => (
        <Marker key={marker.id} coordinate={marker} title={marker.title} />
      ))}
    </MapView>
  );
}
