import type { PropsWithChildren } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  ReduceMotion,
} from 'react-native-reanimated';
export function AnimatedPressable({
  children,
  label,
  onPress,
}: PropsWithChildren<{ label: string; onPress: () => void }>) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      onPressIn={() => {
        scale.set(withTiming(0.97, { duration: 100, reduceMotion: ReduceMotion.System }));
      }}
      onPressOut={() => {
        scale.set(withTiming(1, { duration: 100, reduceMotion: ReduceMotion.System }));
      }}
    >
      <Animated.View style={style}>{children}</Animated.View>
    </Pressable>
  );
}
