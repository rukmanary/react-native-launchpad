import { StyleSheet, Text } from 'react-native';
import { OtpInput } from 'react-native-otp-entry';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import { useTheme } from '@/shared/theme/theme';

export const OtpEntry = ({
  onComplete,
  length = 6,
  autoFocus = true,
  blurOnFilled = false,
  label = 'Verification code',
}: {
  onComplete: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
  blurOnFilled?: boolean;
  label?: string;
}) => {
  const { colors, radii, spacing } = useTheme();

  return (
    <OtpInput
      numberOfDigits={length}
      autoFocus={autoFocus}
      onFilled={onComplete}
      blurOnFilled={blurOnFilled}
      focusColor={colors.primary}
      theme={{
        pinCodeContainerStyle: {
          flex: 1,
          minWidth: 0,
          marginHorizontal: spacing.xs / 2,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          borderRadius: radii.md,
        },
        pinCodeTextStyle: { color: colors.text },
        focusStickStyle: { backgroundColor: colors.primary },
      }}
      textInputProps={{
        accessibilityLabel: label,
        autoComplete: 'one-time-code',
        textContentType: 'oneTimeCode',
      }}
    />
  );
};

export const ControlledOtp = ({
  value,
  onChange,
  length = 6,
  secure = false,
  label = secure ? 'PIN' : 'Verification code',
}: {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  secure?: boolean;
  label?: string;
}) => {
  const { colors, radii, spacing } = useTheme();
  const onChangeDigits = (input: string) => onChange(input.replace(/[^0-9]/g, '').slice(0, length));
  const ref = useBlurOnFulfill({ value, cellCount: length });
  const [inputProps, getCellOnLayout] = useClearByFocusCell({ value, setValue: onChangeDigits });

  return (
    <CodeField
      ref={ref}
      value={value}
      onChangeText={onChangeDigits}
      {...inputProps}
      cellCount={length}
      maxLength={length}
      keyboardType="number-pad"
      secureTextEntry={secure}
      textContentType={secure ? 'none' : 'oneTimeCode'}
      autoComplete={secure ? 'off' : 'one-time-code'}
      accessibilityLabel={label}
      rootStyle={{ gap: spacing.xs }}
      renderCell={({ index, symbol, isFocused }) => (
        <Text
          key={index}
          onLayout={getCellOnLayout(index)}
          accessible={false}
          style={[
            styles.cell,
            {
              borderColor: isFocused ? colors.primary : colors.border,
              borderRadius: radii.md,
              backgroundColor: colors.surface,
              color: colors.text,
            },
          ]}
        >
          {symbol ? secure ? '•' : symbol : isFocused ? <Cursor /> : null}
        </Text>
      )}
    />
  );
};

export const PinInput = (props: Omit<Parameters<typeof ControlledOtp>[0], 'secure'>) => (
  <ControlledOtp {...props} secure />
);

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    lineHeight: 46,
    fontSize: 22,
    textAlign: 'center',
    borderWidth: 1,
  },
});
