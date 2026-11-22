import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '@/shared/theme/theme';
import { AppModal } from '@/shared/ui/AppModal';
import { AppText } from '@/shared/ui/AppText';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';

export type DropdownOption<Value extends string> = { value: Value; label: string };

export const Dropdown = <Value extends string>({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  cancelLabel = 'Cancel',
  disabled = false,
  showLabel = true,
  compact = false,
}: {
  label: string;
  value: Value | null;
  options: readonly DropdownOption<Value>[];
  onChange: (value: Value) => void;
  placeholder?: string;
  cancelLabel?: string;
  disabled?: boolean;
  showLabel?: boolean;
  compact?: boolean;
}) => {
  const { colors, radii, spacing } = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  const unavailable = disabled || options.length === 0;
  const expanded = open && !unavailable;
  const close = () => setOpen(false);

  return (
    <View style={{ gap: spacing.sm }}>
      {showLabel ? <AppText>{label}</AppText> : null}
      <Pressable
        accessibilityRole="combobox"
        accessibilityLabel={label}
        accessibilityValue={{ text: selected?.label ?? placeholder }}
        accessibilityState={{ disabled: unavailable, expanded }}
        disabled={unavailable}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.option,
          compact && styles.compact,
          {
            paddingHorizontal: compact ? spacing.sm : spacing.md,
            borderRadius: compact ? radii.pill : radii.md,
            borderColor: colors.border,
            backgroundColor:
              unavailable || pressed || compact ? colors.surfaceMuted : colors.surface,
          },
        ]}
      >
        <AppText variant={compact ? 'caption' : 'body'} tone={selected ? 'normal' : 'muted'}>
          {selected?.label ?? placeholder}
        </AppText>
        {compact ? <Icon name="chevron-down" size={14} color={colors.muted} /> : null}
      </Pressable>
      <AppModal open={expanded} onClose={close} variant="dialog" dismissOnBackdrop>
        <AppText variant="heading">{label}</AppText>
        <View accessibilityRole="radiogroup">
          {options.map((option) => {
            const checked = option.value === value;

            return (
              <Pressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityState={{ checked }}
                onPress={() => {
                  close();
                  onChange(option.value);
                }}
                style={({ pressed }) => [
                  styles.option,
                  {
                    paddingHorizontal: spacing.md,
                    borderRadius: radii.md,
                    borderColor: checked ? colors.primary : 'transparent',
                    backgroundColor: checked || pressed ? colors.primaryMuted : colors.surface,
                  },
                ]}
              >
                <AppText>{option.label}</AppText>
              </Pressable>
            );
          })}
        </View>
        <Button label={cancelLabel} onPress={close} variant="secondary" />
      </AppModal>
    </View>
  );
};

const styles = StyleSheet.create({
  option: { borderWidth: 1, minHeight: 48, justifyContent: 'center' },
  compact: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 4 },
});
