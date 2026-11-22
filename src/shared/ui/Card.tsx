import { StyleSheet, View, type ViewProps } from 'react-native';
import { useTheme } from '@/shared/theme/theme';

export const Card = ({ style, ...props }: ViewProps) => {
  const { colors, radii, spacing } = useTheme();

  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radii.lg,
          borderWidth: StyleSheet.hairlineWidth,
          padding: spacing.md,
          gap: spacing.sm,
        },
        style,
      ]}
    />
  );
};
