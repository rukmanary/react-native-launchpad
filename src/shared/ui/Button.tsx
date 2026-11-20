import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, radii } from '@/shared/theme/theme';

export function Button({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  testID,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  testID?: string;
}) {
  const secondary = variant === 'secondary';
  const textColor = secondary ? colors.primary : colors.surface;

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
        secondary && styles.secondary,
        { opacity: disabled ? 0.5 : pressed ? 0.8 : 1 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    minHeight: 48,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: { backgroundColor: colors.surface, borderColor: colors.primary, borderWidth: 1 },
  label: { fontWeight: '600', fontSize: 16 },
});
