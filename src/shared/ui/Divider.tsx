import { StyleSheet, View, type ViewProps } from 'react-native';
import { useTheme } from '@/shared/theme/theme';

export const Divider = ({ style, ...props }: ViewProps) => {
  const { colors } = useTheme();

  return (
    <View
      {...props}
      accessible={false}
      style={[{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }, style]}
    />
  );
};
