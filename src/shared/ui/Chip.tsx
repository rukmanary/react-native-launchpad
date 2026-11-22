import { Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '@/shared/ui/AppText';
import { useTheme } from '@/shared/theme/theme';

type Props = { label: string; selected?: boolean; disabled?: boolean; onPress: () => void };

export const Chip = ({ label, selected = false, disabled = false, onPress }: Props) => {
  const { colors, radii, spacing } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? colors.primaryMuted : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
          borderRadius: radii.pill,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
          opacity: disabled ? 0.5 : pressed ? 0.75 : 1,
        },
      ]}
    >
      <ThemedText variant="caption" tone={selected ? 'primary' : 'normal'}>
        {label}
      </ThemedText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: { alignSelf: 'flex-start', borderWidth: 1, minHeight: 48, justifyContent: 'center' },
});
