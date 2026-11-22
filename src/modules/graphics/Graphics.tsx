import type { ComponentProps, PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Canvas, Circle, Group } from 'react-native-skia';
import { CartesianChart, Line } from 'victory-native';
import Svg, { Path } from 'react-native-svg';
import { AppText } from '@/shared/ui/AppText';
import { useTheme } from '@/shared/theme/theme';

type GradientProps = Omit<ComponentProps<typeof LinearGradient>, 'colors'> & {
  colors?: ComponentProps<typeof LinearGradient>['colors'];
};

export const GradientSurface = ({ colors: gradient, ...props }: GradientProps) => {
  const { colors } = useTheme();

  return <LinearGradient {...props} colors={gradient ?? [colors.primary, colors.primaryMuted]} />;
};

export const StatusIllustration = () => {
  const { colors } = useTheme();

  return (
    <Canvas style={styles.illustration}>
      <Group>
        <Circle cx={80} cy={80} r={64} color={colors.primary} />
        <Circle cx={104} cy={56} r={24} color={colors.primaryMuted} />
      </Group>
    </Canvas>
  );
};

export const LineChart = ({
  data,
  accessibilityLabel = 'Trend chart',
}: {
  data: Array<{ x: number; y: number }>;
  accessibilityLabel?: string;
}) => {
  const { colors } = useTheme();

  if (data.length < 2) return <AppText tone="muted">At least two points are required</AppText>;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={styles.chart}
    >
      <CartesianChart data={data} xKey="x" yKeys={['y']}>
        {({ points }) => <Line points={points.y} color={colors.primary} strokeWidth={3} />}
      </CartesianChart>
    </View>
  );
};

export const CheckIllustration = () => {
  const { colors } = useTheme();

  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" accessibilityLabel="Complete">
      <Path d="M5 12l4 4L19 6" stroke={colors.success} strokeWidth={2} fill="none" />
    </Svg>
  );
};

export const GraphicContainer = ({ children, style, ...props }: PropsWithChildren<ViewProps>) => {
  const { colors, radii } = useTheme();

  return (
    <View
      {...props}
      style={[styles.clipped, { borderRadius: radii.lg, backgroundColor: colors.surface }, style]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  chart: { height: 240 },
  clipped: { overflow: 'hidden' },
  illustration: { height: 160, width: 160 },
});
