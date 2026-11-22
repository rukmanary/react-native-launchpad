import { useRef, type ComponentRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  foundationComponents,
  type ShowcaseEntry,
  type ShowcaseId,
} from '@/features/component-showcase/model/showcase';
import { FoundationsShowcaseExamples } from '@/features/component-showcase/components/FoundationsShowcaseExamples';
import { AppText } from '@/shared/ui/AppText';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Screen } from '@/shared/ui/Screen';
import { useTheme } from '@/shared/theme/theme';

type Props = {
  entries: readonly (ShowcaseEntry & { available: boolean })[];
  onOpenDemo: (id: ShowcaseId) => void;
  themeActionLabel: string;
  onToggleTheme: () => void;
};

const ComponentNames = ({ names }: { names: readonly string[] }) => {
  const { colors, radii, spacing } = useTheme();

  return (
    <View style={[styles.names, { gap: spacing.sm }]}>
      {names.map((name) => (
        <AppText
          key={name}
          variant="caption"
          style={{
            backgroundColor: colors.surfaceMuted,
            borderRadius: radii.md,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
          }}
        >
          {name}
        </AppText>
      ))}
    </View>
  );
};

export const ComponentShowcaseScreen = ({
  entries,
  onOpenDemo,
  themeActionLabel,
  onToggleTheme,
}: Props) => {
  const { spacing, mode } = useTheme();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const foundationsTop = useRef(0);

  return (
    <Screen>
      <ScrollView ref={scroll} contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <AppText variant="title" testID="component-title">
          Component Showcase
        </AppText>

        <Card>
          <View style={[styles.preview, { gap: spacing.sm }]}>
            <AppText variant="heading">Theme preview</AppText>
            <Badge label={mode === 'dark' ? 'Dark' : 'Light'} />
          </View>
          <Button label={themeActionLabel} variant="secondary" onPress={onToggleTheme} />
        </Card>

        <Card>
          <AppText variant="heading">Foundations</AppText>
          <ComponentNames names={foundationComponents} />
          <Button
            label="Try foundations"
            onPress={() => scroll.current?.scrollTo({ y: foundationsTop.current })}
          />
        </Card>

        {entries.map(({ id, title, components, available, optionalModule }) => (
          <Card key={id}>
            <AppText variant="heading">{title}</AppText>
            <ComponentNames names={components} />
            {available ? (
              <Button label={`Open ${title}`} onPress={() => onOpenDemo(id)} />
            ) : (
              <AppText variant="caption" tone="muted">
                Include the {optionalModule} module to open this demo.
              </AppText>
            )}
          </Card>
        ))}

        <View
          style={{ gap: spacing.md }}
          onLayout={({ nativeEvent }) => {
            foundationsTop.current = nativeEvent.layout.y;
          }}
        >
          <AppText variant="heading">Foundations examples</AppText>
          <FoundationsShowcaseExamples />
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  preview: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap' },
  names: { flexDirection: 'row', flexWrap: 'wrap' },
});
