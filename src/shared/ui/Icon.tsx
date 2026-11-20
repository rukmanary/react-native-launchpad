import { Lucide } from '@react-native-vector-icons/lucide/static';
import type { ComponentProps } from 'react';

export function Icon(props: ComponentProps<typeof Lucide>) {
  return <Lucide {...props} accessible={props.accessibilityLabel !== undefined} />;
}
