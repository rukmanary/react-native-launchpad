import { Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/theme/theme';
import { AppText } from '@/shared/ui/AppText';
import { TextField, type TextFieldProps } from '@/shared/ui/TextField';

export type SearchBarProps = Omit<
  TextFieldProps,
  'value' | 'defaultValue' | 'onChangeText' | 'trailing' | 'label'
> & {
  value: string;
  onChangeText: (value: string) => void;
  label?: string;
  clearLabel?: string;
};

export const SearchBar = ({
  value,
  onChangeText,
  label = 'Search',
  clearLabel = 'Clear search',
  ...props
}: SearchBarProps) => {
  const { colors, radii, spacing } = useTheme();

  return (
    <TextField
      label={label}
      value={value}
      onChangeText={onChangeText}
      enterKeyHint="search"
      autoCorrect={false}
      {...props}
      trailing={
        value && props.editable !== false ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={clearLabel}
            onPress={() => onChangeText('')}
            style={({ pressed }) => [
              styles.clear,
              {
                backgroundColor: pressed ? colors.primaryMuted : colors.surfaceMuted,
                borderRadius: radii.md,
                paddingHorizontal: spacing.md,
              },
            ]}
          >
            <AppText variant="caption">Clear</AppText>
          </Pressable>
        ) : null
      }
    />
  );
};

const styles = StyleSheet.create({
  clear: { minHeight: 48, minWidth: 48, alignItems: 'center', justifyContent: 'center' },
});
