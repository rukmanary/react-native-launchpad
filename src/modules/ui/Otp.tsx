import { Text } from 'react-native';
import { OtpInput } from 'react-native-otp-entry';
import { CodeField, Cursor } from 'react-native-confirmation-code-field';
export function OtpEntry({
  onComplete,
  length = 6,
}: {
  onComplete: (value: string) => void;
  length?: number;
}) {
  return (
    <OtpInput
      numberOfDigits={length}
      onFilled={onComplete}
      textInputProps={{
        accessibilityLabel: 'Verification code',
        autoComplete: 'one-time-code',
        textContentType: 'oneTimeCode',
      }}
    />
  );
}
export function ControlledOtp({
  value,
  onChange,
  length = 6,
}: {
  value: string;
  onChange: (value: string) => void;
  length?: number;
}) {
  return (
    <CodeField
      value={value}
      onChangeText={onChange}
      cellCount={length}
      keyboardType="number-pad"
      textContentType="oneTimeCode"
      autoComplete="one-time-code"
      accessibilityLabel="Verification code"
      renderCell={({ index, symbol, isFocused }) => (
        <Text key={index} style={{ fontSize: 24, padding: 12, borderWidth: 1, borderRadius: 8 }}>
          {symbol || (isFocused ? <Cursor /> : null)}
        </Text>
      )}
    />
  );
}
