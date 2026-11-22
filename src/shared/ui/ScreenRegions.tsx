import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { ThemedText } from '@/shared/ui/AppText';
import { useTheme } from '@/shared/theme/theme';

type HeaderProps = Omit<ViewProps, 'children'> & {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
};

export const Header = ({ title, subtitle, leading, trailing, style, ...props }: HeaderProps) => {
  const { colors, spacing } = useTheme();

  return (
    <View
      {...props}
      style={[
        styles.header,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          padding: spacing.md,
          gap: spacing.sm,
        },
        style,
      ]}
    >
      {leading}
      <View style={styles.content}>
        <ThemedText variant="heading">{title}</ThemedText>
        {subtitle ? <ThemedText tone="muted">{subtitle}</ThemedText> : null}
      </View>
      {trailing}
    </View>
  );
};

export const Footer = ({ style, ...props }: ViewProps) => {
  const { colors, spacing } = useTheme();

  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          padding: spacing.md,
          gap: spacing.sm,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: { flex: 1 },
});
