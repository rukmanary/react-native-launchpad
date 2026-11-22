import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/shared/theme/theme';
import { ThemedText } from '@/shared/ui/AppText';

export const Badge = ({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'neutral' | 'primary';
}) => {
  const { colors, radii, spacing } = useTheme();
  const primary = tone === 'primary';

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: primary ? colors.primaryMuted : colors.surfaceMuted,
        borderColor: colors.border,
        borderRadius: radii.pill,
        borderWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
      }}
    >
      <ThemedText variant="caption" tone={primary ? 'primary' : 'normal'}>
        {label}
      </ThemedText>
    </View>
  );
};
