import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/shared/ui/AppText';
import { useTheme } from '@/shared/theme/theme';

type ControlProps = {
  label: string;
  checked: boolean;
  disabled?: boolean;
  testID?: string;
};

type OptionProps = ControlProps & { role: 'checkbox' | 'radio'; onPress: () => void };

const SelectionControl = ({ label, checked, disabled, testID, role, onPress }: OptionProps) => {
  const { colors, radii, spacing } = useTheme();
  const radio = role === 'radio';

  return (
    <Pressable
      accessibilityRole={role}
      accessibilityLabel={label}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { gap: spacing.sm, opacity: disabled ? 0.5 : pressed ? 0.75 : 1 },
      ]}
    >
      <View
        style={[
          styles.indicator,
          {
            backgroundColor: checked && !radio ? colors.primary : colors.surface,
            borderColor: checked ? colors.primary : colors.muted,
            borderRadius: radio ? radii.pill : spacing.xs,
          },
        ]}
      >
        {checked &&
          (radio ? (
            <View
              style={[styles.dot, { backgroundColor: colors.primary, borderRadius: radii.pill }]}
            />
          ) : (
            <ThemedText variant="caption" tone="onPrimary" style={styles.check}>
              ✓
            </ThemedText>
          ))}
      </View>
      <ThemedText style={styles.label}>{label}</ThemedText>
    </Pressable>
  );
};

export const Checkbox = ({
  onCheckedChange,
  ...props
}: ControlProps & { onCheckedChange: (checked: boolean) => void }) => (
  <SelectionControl {...props} role="checkbox" onPress={() => onCheckedChange(!props.checked)} />
);

export const Radio = ({ onSelect, ...props }: ControlProps & { onSelect: () => void }) => (
  <SelectionControl {...props} role="radio" onPress={onSelect} />
);

type RadioOption = { label: string; value: string; disabled?: boolean };

export const RadioGroup = ({
  options,
  value,
  onValueChange,
}: {
  options: readonly RadioOption[];
  value: string;
  onValueChange: (value: string) => void;
}) => (
  <View accessibilityRole="radiogroup">
    {options.map((option) => (
      <Radio
        key={option.value}
        label={option.label}
        checked={option.value === value}
        disabled={option.disabled}
        onSelect={() => onValueChange(option.value)}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 48 },
  indicator: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 12, height: 12 },
  check: { fontWeight: '700', lineHeight: 18 },
  label: { flex: 1 },
});
