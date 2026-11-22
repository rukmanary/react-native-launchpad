import {
  Pressable,
  ActivityIndicator,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/shared/theme/theme';
import { ThemedText } from '@/shared/ui/AppText';

export const Button = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
  testID,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) => {
  const { colors, radii, spacing } = useTheme();
  const secondary = variant === 'secondary';
  const danger = variant === 'danger';
  const textColor = secondary ? colors.primary : danger ? colors.dangerText : colors.primaryText;
  const backgroundColor = secondary ? colors.surface : danger ? colors.danger : colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      testID={testID}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor,
          borderRadius: radii.md,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderColor: colors.primary,
          borderWidth: secondary ? 1 : 0,
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <ThemedText style={[styles.label, { color: textColor }]}>{label}</ThemedText>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontWeight: '600', textAlign: 'center' },
});
