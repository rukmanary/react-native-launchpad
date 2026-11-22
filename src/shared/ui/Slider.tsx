import { useState } from 'react';
import { I18nManager, StyleSheet, View, type GestureResponderEvent } from 'react-native';
import { ThemedText } from '@/shared/ui/AppText';
import { useTheme } from '@/shared/theme/theme';

type Props = {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  onSlidingComplete?: (value: number) => void;
  onSlidingCancel?: () => void;
  accessibilityValueText?: string;
  showLabels?: boolean;
  compact?: boolean;
  minimum?: number;
  maximum?: number;
  step?: number;
  disabled?: boolean;
};

const adjustActions = [{ name: 'increment' }, { name: 'decrement' }];
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const Slider = ({
  label,
  value,
  onValueChange,
  onSlidingComplete,
  onSlidingCancel,
  accessibilityValueText,
  showLabels = true,
  compact = false,
  minimum = 0,
  maximum = 100,
  step = 1,
  disabled = false,
}: Props) => {
  const { colors, radii, spacing } = useTheme();
  const [width, setWidth] = useState(0);
  const thumbRadius = compact ? 6 : 10;
  const trackHeight = compact ? 3 : 4;
  const min = Number.isFinite(minimum) ? minimum : 0;
  const max = Number.isFinite(maximum - min) && maximum > min ? maximum : min;
  const range = max - min;
  const increment = Number.isFinite(step) && step > 0 ? step : 1;
  const current = Number.isFinite(value) ? clamp(value, min, max) : min;
  const position = `${range ? ((current - min) / range) * 100 : 0}%` as const;
  const inactive = disabled || range === 0;

  const update = (candidate: number) => {
    if (inactive) return;

    const snapped = min + Math.round((candidate - min) / increment) * increment;
    const next =
      candidate <= min || candidate >= max
        ? clamp(candidate, min, max)
        : clamp(Number(snapped.toPrecision(12)), min, max);

    if (next !== current) onValueChange(next);

    return next;
  };

  const updateFromTouch = ({ nativeEvent }: GestureResponderEvent) => {
    const trackWidth = width - thumbRadius * 2;
    if (trackWidth <= 0) return;

    const offset = I18nManager.isRTL ? width - nativeEvent.locationX : nativeEvent.locationX;
    const fraction = clamp((offset - thumbRadius) / trackWidth, 0, 1);

    return update(min + fraction * range);
  };

  const previewTouch = (event: GestureResponderEvent) => {
    updateFromTouch(event);
  };

  return (
    <View>
      {showLabels ? (
        <View style={[styles.labels, { gap: spacing.sm }]}>
          <ThemedText style={styles.label}>{label}</ThemedText>
          <ThemedText variant="caption" tone="muted">
            {current}
          </ThemedText>
        </View>
      ) : null}
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min, max, now: current, text: accessibilityValueText }}
        accessibilityState={{ disabled: inactive }}
        accessibilityActions={inactive ? undefined : adjustActions}
        onAccessibilityAction={({ nativeEvent }) => {
          const { actionName } = nativeEvent;
          if (actionName !== 'increment' && actionName !== 'decrement') return;

          const next = update(current + (actionName === 'increment' ? increment : -increment));
          if (next !== undefined) onSlidingComplete?.(next);
        }}
        onLayout={({ nativeEvent }) => setWidth(nativeEvent.layout.width)}
        onStartShouldSetResponder={() => !inactive}
        onResponderGrant={previewTouch}
        onResponderMove={previewTouch}
        onResponderRelease={
          onSlidingComplete &&
          ((event) => {
            const next = updateFromTouch(event);
            if (next !== undefined) onSlidingComplete(next);
          })
        }
        onResponderTerminate={onSlidingCancel}
        style={[
          styles.touchTarget,
          { paddingHorizontal: thumbRadius, opacity: inactive ? 0.5 : 1 },
        ]}
      >
        <View
          pointerEvents="none"
          style={{
            height: trackHeight,
            backgroundColor: colors.border,
            borderRadius: radii.pill,
          }}
        >
          <View
            style={{
              width: position,
              height: '100%',
              backgroundColor: colors.primary,
              borderRadius: radii.pill,
            }}
          />
          <View
            style={{
              position: 'absolute',
              start: position,
              top: trackHeight / 2 - thumbRadius,
              marginStart: -thumbRadius,
              width: thumbRadius * 2,
              height: thumbRadius * 2,
              borderRadius: thumbRadius,
              backgroundColor: colors.primary,
            }}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  labels: { alignItems: 'center', flexDirection: 'row' },
  label: { flexShrink: 1, flexGrow: 1 },
  touchTarget: { minHeight: 48, justifyContent: 'center' },
});
