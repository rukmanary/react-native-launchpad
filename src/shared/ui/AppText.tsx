import { StyleSheet, Text, type TextProps } from 'react-native';
import { colors } from '@/shared/theme/theme';

const typography = StyleSheet.create({
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  heading: { fontSize: 20, lineHeight: 26, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24 },
  caption: { fontSize: 14, lineHeight: 20 },
});

type AppTextProps = TextProps & {
  variant?: keyof typeof typography;
  tone?: 'normal' | 'muted' | 'danger';
};

const textColors = { normal: colors.text, muted: colors.muted, danger: colors.danger };

export function AppText({ variant = 'body', tone = 'normal', style, ...props }: AppTextProps) {
  const header = variant === 'title' || variant === 'heading';

  return (
    <Text
      accessibilityRole={header ? 'header' : undefined}
      {...props}
      style={[typography[variant], { color: textColors[tone] }, style]}
    />
  );
}
