import type { ReactNode } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Carousel } from 'react-native-reanimated-carousel';
import PagerView from 'react-native-pager-view';

export function AppCarousel<T>({
  items,
  renderItem,
  height = 220,
}: {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  height?: number;
}) {
  const { width } = useWindowDimensions();

  return (
    <Carousel
      style={{ width, height }}
      data={items}
      loop={false}
      renderItem={({ item, index }) => <View>{renderItem(item, index)}</View>}
    />
  );
}

export function AppPager({
  pages,
  onPage,
}: {
  pages: Array<{ id: string; content: ReactNode }>;
  onPage?: (index: number) => void;
}) {
  return (
    <PagerView
      style={{ flex: 1 }}
      initialPage={0}
      onPageSelected={(event) => onPage?.(event.nativeEvent.position)}
    >
      {pages.map((page) => (
        <View key={page.id} collapsable={false}>
          {page.content}
        </View>
      ))}
    </PagerView>
  );
}
