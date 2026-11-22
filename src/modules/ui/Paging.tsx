import { useState, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Carousel } from 'react-native-reanimated-carousel';
import PagerView from 'react-native-pager-view';

export const AppCarousel = <T,>({
  items,
  renderItem,
  height = 220,
  onPage,
}: {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  height?: number;
  onPage?: (index: number) => void;
}) => {
  const [width, setWidth] = useState(0);

  return (
    <View style={{ height }} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      {width > 0 && items.length > 0 ? (
        <Carousel
          style={{ width, height }}
          itemSize={width}
          data={items}
          loop={false}
          overscrollEnabled={false}
          snapMode="page"
          onSnapToItem={onPage}
          onConfigurePanGesture={(gesture) => {
            gesture.activeOffsetX([-10, 10]).failOffsetY([-10, 10]);
          }}
          renderWindowSize={5}
          renderItem={({ item, index }) => (
            <View style={{ flex: 1 }}>{renderItem(item, index)}</View>
          )}
        />
      ) : null}
    </View>
  );
};

export const AppPager = ({
  pages,
  onPage,
  style,
}: {
  pages: Array<{ id: string; content: ReactNode }>;
  onPage?: (index: number) => void;
  style?: StyleProp<ViewStyle>;
}) => {
  return (
    <PagerView
      style={[{ flex: 1 }, style]}
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
};
