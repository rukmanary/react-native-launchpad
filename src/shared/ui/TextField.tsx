import { useId, useState, type ComponentProps, type ReactNode } from 'react';
import { TextInput, Text, View, StyleSheet, type TextInputProps } from 'react-native';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { useTheme } from '@/shared/theme/theme';

export type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
  trailing?: ReactNode;
  ref?: ComponentProps<typeof TextInput>['ref'];
};

export const TextField = ({
  label,
  error,
  hint,
  trailing,
  style,
  editable = true,
  onFocus,
  onBlur,
  ...props
}: TextFieldProps) => {
  const id = useId();
  const { colors, radii, spacing } = useTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.danger : focused && editable ? colors.primary : colors.border;

  return (
    <View style={{ gap: spacing.sm }}>
      <Text nativeID={id} style={[styles.label, { color: colors.text }]}>
        {label}
      </Text>
      <View style={[styles.row, { gap: spacing.sm }]}>
        <TextInput
          accessibilityLabel={label}
          accessibilityLabelledBy={id}
          accessibilityHint={error ?? hint}
          accessibilityState={{ disabled: !editable }}
          placeholderTextColor={colors.muted}
          editable={editable}
          {...props}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[
            styles.input,
            {
              borderColor,
              borderRadius: radii.md,
              paddingHorizontal: spacing.md,
              color: colors.text,
              backgroundColor: editable ? colors.surface : colors.surfaceMuted,
            },
            style,
          ]}
        />
        {trailing}
      </View>
      {error ? (
        <Text accessibilityLiveRegion="polite" style={{ color: colors.danger }}>
          {error}
        </Text>
      ) : hint ? (
        <Text style={{ color: colors.muted }}>{hint}</Text>
      ) : null}
    </View>
  );
};

export const FormField = <T extends FieldValues>({
  control,
  name,
  label,
  ...props
}: TextInputProps & { control: Control<T>; name: Path<T>; label: string }) => {
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
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: 16, fontWeight: '600' },
  input: {
    flex: 1,
    borderWidth: 1,
    minHeight: 48,
    fontSize: 16,
  },
});
