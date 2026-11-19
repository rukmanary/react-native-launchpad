import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../theme/theme';
export function Button({
  label,
  onPress,
  loading = false,
  disabled = false,
  testID,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      testID={testID}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [styles.button, { opacity: disabled ? 0.5 : pressed ? 0.8 : 1 }]}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.label}>{label}</Text>}
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    minHeight: 48,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
