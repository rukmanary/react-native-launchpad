import type { PropsWithChildren } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from '@react-native-community/blur';

export function BlurTarget({
  children,
  style,
}: PropsWithChildren<{ targetKey: string; style?: StyleProp<ViewStyle> }>) {
  return <View style={style}>{children}</View>;
}

export function BlurSurface({
  children,
  style,
  radius = 16,
}: PropsWithChildren<{ targetKey: string; radius?: number; style?: StyleProp<ViewStyle> }>) {
  return (
    <BlurView
      blurType="light"
      blurAmount={radius}
      reducedTransparencyFallbackColor="#FFFFFF"
      style={style}
    >
      {children}
    </BlurView>
  );
}
