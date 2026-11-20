import { useId, type ComponentProps } from 'react';
import { TextInput, Text, View, StyleSheet, type TextInputProps } from 'react-native';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { colors } from '@/shared/theme/theme';

export function TextField({
  label,
  error,
  ...props
}: TextInputProps & {
  label: string;
  error?: string;
  ref?: ComponentProps<typeof TextInput>['ref'];
}) {
  const id = useId();

  return (
    <View style={styles.group}>
      <Text nativeID={id} style={styles.label}>
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        accessibilityLabelledBy={id}
        accessibilityHint={error}
        placeholderTextColor={colors.muted}
        {...props}
        style={[styles.input, props.style]}
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  ...props
}: TextInputProps & { control: Control<T>; name: Path<T>; label: string }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value, ref }, fieldState: { error } }) => (
        <TextField
          {...props}
          ref={ref}
          label={label}
          value={typeof value === 'string' ? value : ''}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  group: { gap: 8 },
  label: { color: colors.text, fontSize: 16, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    minHeight: 48,
    color: colors.text,
    backgroundColor: colors.surface,
    fontSize: 16,
  },
  error: { color: colors.danger },
});
