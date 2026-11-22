import { useState } from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { Blurhash } from 'react-native-blurhash';

import alpineLake from '@/assets/showcase/ui/alpine-lake.jpg';
import sunsetCoast from '@/assets/showcase/ui/sunset-coast.jpg';
import { AppCarousel } from '@/modules/ui/Paging';
import { useTheme } from '@/shared/theme/theme';
import { AppText } from '@/shared/ui/AppText';

type Slide = {
  source: ImageSourcePropType;
  label: string;
  loadingPreview?: string;
};

const slides: Slide[] = [
  { source: alpineLake, label: 'Alpine lake at sunrise' },
  {
    source: sunsetCoast,
    label: 'Coastline at sunset',
    loadingPreview: 'LOG%#]Kiz:t6}o}rt7sl=w=vbZNZ',
  },
];

const SlideImage = ({ source, label, loadingPreview }: Slide) => {
  const { colors, radii } = useTheme();

  return (
    <View style={[styles.frame, { borderRadius: radii.md, backgroundColor: colors.surfaceMuted }]}>
      {loadingPreview ? (
        <Blurhash
          blurhash={loadingPreview}
          decodeWidth={32}
          decodeHeight={18}
          accessible
          accessibilityRole="image"
          accessibilityLabel={label + ', loading preview'}
          style={styles.image}
        />
      ) : (
        <Image
          source={source}
          accessible
          accessibilityLabel={label}
          resizeMode="cover"
          style={styles.image}
        />
      )}
    </View>
  );
};

export const CarouselShowcase = () => {
  const [page, setPage] = useState(0);

  return (
    <>
      <AppCarousel
        items={slides}
        height={184}
        renderItem={(item) => <SlideImage {...item} />}
        onPage={setPage}
      />
      <AppText tone="muted" accessibilityLiveRegion="polite">
        {`Slide ${page + 1} of ${slides.length}`}
        {slides[page]?.loadingPreview ? ' · BlurHash loading preview' : ''}
      </AppText>
    </>
  );
};

const styles = StyleSheet.create({
  frame: { flex: 1, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
});
