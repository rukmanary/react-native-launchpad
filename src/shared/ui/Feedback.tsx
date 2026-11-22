import {
  ActivityIndicator,
  StyleSheet,
  View,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { ThemedText } from '@/shared/ui/AppText';
import { useTheme } from '@/shared/theme/theme';

type ProgressProps = { value: number; label: string; style?: StyleProp<ViewStyle> };

export const ProgressBar = ({ value, label, style }: ProgressProps) => {
  const { colors, radii } = useTheme();
  const ratio = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
  const percent = Math.round(ratio * 100);

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      style={[
        styles.track,
        { backgroundColor: colors.surfaceMuted, borderRadius: radii.pill },
        style,
      ]}
    >
      <View style={{ width: `${percent}%`, height: '100%', backgroundColor: colors.primary }} />
    </View>
  );
};

export const Loading = ({
  label = 'Loading',
  showLabel = false,
}: {
  label?: string;
  showLabel?: boolean;
}) => {
  const { colors, spacing } = useTheme();

  return (
    <View
      accessible
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
      style={[styles.row, { gap: spacing.sm }]}
    >
      <ActivityIndicator color={colors.primary} />
      {showLabel ? <ThemedText>{label}</ThemedText> : null}
    </View>
  );
};

type SkeletonProps = {
  width?: DimensionValue;
  height?: DimensionValue;
  style?: StyleProp<ViewStyle>;
};

export const Skeleton = ({ width = '100%', height = 16, style }: SkeletonProps) => {
  const { colors, radii } = useTheme();

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        { width, height, borderRadius: radii.md, backgroundColor: colors.surfaceMuted },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  track: { height: 8, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center' },
});
