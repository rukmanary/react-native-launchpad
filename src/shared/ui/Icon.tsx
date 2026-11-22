import { Lucide } from '@react-native-vector-icons/lucide/static';
import type { ComponentProps } from 'react';
import { useTheme } from '@/shared/theme/theme';

export const Icon = ({ color, ...props }: ComponentProps<typeof Lucide>) => {
  const { colors } = useTheme();

  return (
    <Lucide
      {...props}
      color={color ?? colors.text}
      accessible={props.accessibilityLabel !== undefined}
    />
  );
};
