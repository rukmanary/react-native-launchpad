import type { Ref } from 'react';
import { FlashList, type FlashListProps, type FlashListRef } from '@shopify/flash-list';
import { useTheme } from '@/shared/theme/theme';

export type AppListProps<Item> = FlashListProps<Item> & { ref?: Ref<FlashListRef<Item>> };

export const AppList = <Item,>({ style, ...props }: AppListProps<Item>) => {
  const { colors } = useTheme();

  return <FlashList {...props} style={[{ backgroundColor: colors.background }, style]} />;
};
