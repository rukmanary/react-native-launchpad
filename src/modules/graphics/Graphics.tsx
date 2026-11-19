import type { ComponentProps, PropsWithChildren } from 'react';
import { View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Canvas, Circle, Group } from 'react-native-skia';
import { CartesianChart, Line } from 'victory-native';
import Svg, { Path } from 'react-native-svg';
export function GradientSurface(props: ComponentProps<typeof LinearGradient>) {
  return <LinearGradient {...props} />;
}
export function StatusIllustration() {
  return (
    <Canvas style={{ height: 160, width: 160 }}>
      <Group>
        <Circle cx={80} cy={80} r={64} color="#2358C5" />
        <Circle cx={104} cy={56} r={24} color="#97BCFF" />
      </Group>
    </Canvas>
  );
}
export function LineChart({ data }: { data: Array<{ x: number; y: number }> }) {
  return (
    <View accessibilityRole="image" accessibilityLabel="Trend chart" style={{ height: 240 }}>
      <CartesianChart data={data} xKey="x" yKeys={['y']}>
        {({ points }) => <Line points={points.y} color="#2358C5" strokeWidth={3} />}
      </CartesianChart>
    </View>
  );
}
export function CheckIllustration() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" accessibilityLabel="Complete">
      <Path d="M5 12l4 4L19 6" stroke="#2358C5" strokeWidth={2} fill="none" />
    </Svg>
  );
}
export function GraphicContainer({ children }: PropsWithChildren) {
  return <View style={{ overflow: 'hidden', borderRadius: 16 }}>{children}</View>;
}
