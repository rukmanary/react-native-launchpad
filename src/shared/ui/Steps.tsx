import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/shared/ui/AppText';
import { useTheme } from '@/shared/theme/theme';

type Step = { id: string; label: string };

export const Steps = ({ items, current }: { items: readonly Step[]; current: number }) => {
  const { colors, radii, spacing } = useTheme();
  const activeStep = Number.isFinite(current) ? Math.max(0, Math.floor(current)) : 0;

  return (
    <View style={{ gap: spacing.sm }}>
      {items.map(({ id, label }, index) => {
        const done = index < activeStep;
        const active = index === activeStep;
        const status = done ? 'Completed' : active ? 'Current step' : 'Pending';

        return (
          <View
            key={id}
            accessible
            accessibilityLabel={`${label}, ${status}`}
            accessibilityState={{ selected: active }}
            style={[styles.row, { gap: spacing.sm }]}
          >
            <View
              style={[
                styles.marker,
                {
                  backgroundColor: active ? colors.primary : colors.surfaceMuted,
                  borderRadius: radii.pill,
                },
              ]}
            >
              <ThemedText
                variant="caption"
                tone={active ? 'onPrimary' : done ? 'primary' : 'muted'}
              >
                {done ? '✓' : index + 1}
              </ThemedText>
            </View>
            <ThemedText style={styles.label}>{label}</ThemedText>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  marker: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
  label: { flex: 1 },
});
