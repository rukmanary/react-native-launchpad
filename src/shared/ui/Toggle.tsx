import { StyleSheet, Switch, View } from 'react-native';
import { ThemedText } from '@/shared/ui/AppText';
import { useTheme } from '@/shared/theme/theme';

type Props = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  testID?: string;
};

export const Toggle = ({ label, value, onValueChange, disabled, testID }: Props) => {
  const { colors, spacing } = useTheme();

  return (
    <View style={[styles.row, { gap: spacing.md }]}>
      <ThemedText accessible={false} style={styles.label}>
        {label}
      </ThemedText>
      <Switch
        accessibilityRole="switch"
        accessibilityLabel={label}
        accessibilityState={{ checked: value, disabled }}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={value ? colors.primaryText : colors.surface}
        ios_backgroundColor={colors.border}
        testID={testID}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row', minHeight: 48 },
  label: { flex: 1 },
});
