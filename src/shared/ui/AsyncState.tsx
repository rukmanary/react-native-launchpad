import { ActivityIndicator, Text, View } from 'react-native';
import { Button } from './Button';
export function AsyncState({
  loading,
  error,
  empty,
  onRetry,
}: {
  loading?: boolean;
  error?: Error | null;
  empty?: boolean;
  onRetry?: () => void;
}) {
  return (
    <View accessibilityLiveRegion="polite" style={{ padding: 24, gap: 16 }}>
      {loading ? (
        <ActivityIndicator accessibilityLabel="Loading" />
      ) : error ? (
        <>
          <Text>Data could not be loaded.</Text>
          {onRetry ? <Button label="Try again" onPress={onRetry} /> : null}
        </>
      ) : empty ? (
        <Text>No items yet.</Text>
      ) : null}
    </View>
  );
}
