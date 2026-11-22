import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/shared/ui/AppText';
import { useTheme } from '@/shared/theme/theme';

type Props = PropsWithChildren<{
  title: string;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}>;

export const Expandable = ({ title, expanded, onExpandedChange, children }: Props) => {
  const { colors, spacing } = useTheme();

  return (
    <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ expanded }}
        onPress={() => onExpandedChange(!expanded)}
        style={({ pressed }) => [
          styles.header,
          { backgroundColor: pressed ? colors.surfaceMuted : 'transparent', gap: spacing.sm },
        ]}
      >
        <ThemedText style={styles.label}>{title}</ThemedText>
        <ThemedText accessible={false} tone="primary">
          {expanded ? '−' : '+'}
        </ThemedText>
      </Pressable>
      {expanded ? <View style={{ paddingBottom: spacing.md }}>{children}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  header: { alignItems: 'center', flexDirection: 'row', minHeight: 48 },
  label: { flex: 1, fontWeight: '600' },
});
