import type { PropsWithChildren } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useTheme } from '@/shared/theme/theme';

export const BlurTarget = ({
  children,
  style,
}: PropsWithChildren<{ targetKey: string; style?: StyleProp<ViewStyle> }>) => (
  <View style={style}>{children}</View>
);

export const BlurSurface = ({
  children,
  style,
  radius = 16,
}: PropsWithChildren<{ targetKey: string; radius?: number; style?: StyleProp<ViewStyle> }>) => {
  const { colors, mode } = useTheme();

  return (
    <BlurView
      blurType={mode}
      blurAmount={radius}
      reducedTransparencyFallbackColor={colors.surface}
      style={style}
    >
      {children}
    </BlurView>
  );
};
