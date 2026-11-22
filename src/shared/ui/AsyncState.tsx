import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '@/shared/theme/theme';
import { AppText } from '@/shared/ui/AppText';
import { Button } from '@/shared/ui/Button';

export const AsyncState = ({
  loading,
  error,
  empty,
  onRetry,
}: {
  loading?: boolean;
  error?: Error | null;
  empty?: boolean;
  onRetry?: () => void;
}) => {
  const { colors, spacing } = useTheme();

  return (
    <View accessibilityLiveRegion="polite" style={{ padding: spacing.lg, gap: spacing.md }}>
      {loading ? (
        <ActivityIndicator accessibilityLabel="Loading" color={colors.primary} />
      ) : error ? (
        <>
          <AppText tone="muted">Data could not be loaded.</AppText>
          {onRetry ? <Button label="Try again" onPress={onRetry} /> : null}
        </>
      ) : empty ? (
        <AppText tone="muted">No items yet.</AppText>
      ) : null}
    </View>
  );
};
