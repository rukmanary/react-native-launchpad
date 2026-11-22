import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import {
  CheckIllustration,
  GradientSurface,
  GraphicContainer,
  LineChart,
  StatusIllustration,
} from '@/modules/graphics/Graphics';
import { useTheme } from '@/shared/theme/theme';
import { AppText } from '@/shared/ui/AppText';
import { Button } from '@/shared/ui/Button';
import { Screen } from '@/shared/ui/Screen';

const sampleValues = [
  [2, 4, 3, 8, 7, 10, 14],
  [3, 7, 6, 11, 9, 13, 17],
].map((values) => values.map((y, index) => ({ x: index + 1, y })));

export const GraphicsShowcaseScreen = () => {
  const { colors, spacing } = useTheme();
  const [secondWeek, setSecondWeek] = useState(false);
  const sample = sampleValues[secondWeek ? 1 : 0]!;
  const trend = sample.map(({ y }) => y).join(', ');

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <AppText variant="heading">Graphic view</AppText>
        <GraphicContainer>
          <GradientSurface
            colors={[colors.surface, colors.primaryMuted]}
            style={{ padding: spacing.md, alignItems: 'center' }}
          >
            <StatusIllustration />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <CheckIllustration />
              <AppText>Skia illustration and SVG icon</AppText>
            </View>
          </GradientSurface>
        </GraphicContainer>
        <AppText variant="heading">Activity chart</AppText>
        <GraphicContainer style={{ padding: spacing.md }}>
          <AppText>{secondWeek ? 'Week 2' : 'Week 1'}</AppText>
          <LineChart data={sample} accessibilityLabel={`Daily activity values: ${trend}`} />
        </GraphicContainer>
        <Button
          label={secondWeek ? 'Show week 1' : 'Show week 2'}
          variant="secondary"
          onPress={() => setSecondWeek((value) => !value)}
        />
      </ScrollView>
    </Screen>
  );
};
