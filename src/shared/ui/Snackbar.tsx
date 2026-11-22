import { useEffect, useEffectEvent } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/shared/theme/theme';
import { AppText } from '@/shared/ui/AppText';

export type SnackbarProps = {
  open: boolean;
  message: string;
  onDismiss: () => void;
  action?: { label: string; onPress: () => void };
  /** Set to null for persistent messages and actions requiring more time. */
  durationMs?: number | null;
  dismissLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export const Snackbar = ({
  open,
  message,
  onDismiss,
  action,
  durationMs = action ? null : 5000,
  dismissLabel = 'Dismiss',
  style,
}: SnackbarProps) => {
  const { colors, radii, spacing } = useTheme();
  const dismissAfterTimeout = useEffectEvent(onDismiss);

  useEffect(() => {
    if (!open || !message || durationMs === null || !Number.isFinite(durationMs) || durationMs <= 0)
      return;

    const timer = setTimeout(() => dismissAfterTimeout(), durationMs);
    return () => clearTimeout(timer);
  }, [open, message, durationMs]);

  if (!open || !message) return null;

  return (
    <View
      style={[
        styles.content,
        {
          borderRadius: radii.md,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          padding: spacing.md,
          gap: spacing.sm,
        },
        style,
      ]}
    >
      <AppText accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.message}>
        {message}
      </AppText>
      {action ? (
        <Pressable accessibilityRole="button" onPress={action.onPress} style={styles.action}>
          <AppText style={{ color: colors.primary }}>{action.label}</AppText>
        </Pressable>
      ) : null}
      <Pressable accessibilityRole="button" onPress={onDismiss} style={styles.action}>
        <AppText tone="muted">{dismissLabel}</AppText>
      </Pressable>
    </View>
  );
};

export const Toast = (props: Omit<SnackbarProps, 'action'>) => <Snackbar {...props} />;

const styles = StyleSheet.create({
  content: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', borderWidth: 1 },
  message: { flexGrow: 1, flexShrink: 1, minWidth: 120 },
  action: { minHeight: 48, minWidth: 48, justifyContent: 'center', alignItems: 'center' },
});
