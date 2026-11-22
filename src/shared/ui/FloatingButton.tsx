import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Icon } from '@/shared/ui/Icon';
import { useTheme } from '@/shared/theme/theme';

type Props = {
  label: string;
  icon?: ComponentProps<typeof Icon>['name'];
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const FloatingButton = ({ label, icon = 'plus', onPress, disabled, style }: Props) => {
  const { colors, radii, spacing } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          bottom: spacing.md,
          end: spacing.md,
          backgroundColor: colors.primary,
          borderRadius: radii.lg,
          shadowColor: colors.shadow,
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      <Icon name={icon} size={24} color={colors.primaryText} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
});
