import { View, type ViewProps } from 'react-native';
import { useTheme } from '@/shared/theme/theme';

type Props = ViewProps & { tone?: 'background' | 'surface' | 'muted' | 'transparent' };

export const ThemedView = ({ tone = 'surface', style, ...props }: Props) => {
  const { colors } = useTheme();
  const backgrounds = {
    background: colors.background,
    surface: colors.surface,
    muted: colors.surfaceMuted,
    transparent: 'transparent',
  };

  return <View {...props} style={[{ backgroundColor: backgrounds[tone] }, style]} />;
};
