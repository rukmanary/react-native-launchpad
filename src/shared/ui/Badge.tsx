import { StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '../theme/theme';
import { AppText } from './AppText';

export function Badge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <AppText variant="caption">{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
