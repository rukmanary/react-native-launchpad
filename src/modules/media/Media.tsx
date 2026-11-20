import { useState, type ComponentProps } from 'react';
import { View, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import { Blurhash } from 'react-native-blurhash';
import Video from 'react-native-video';
import { useAppActive } from '../../shared/hooks/useAppActive';

function ImageContent({
  blurhash,
  ...props
}: ComponentProps<typeof FastImage> & { blurhash?: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <View style={props.style}>
      {blurhash && !loaded ? (
        <Blurhash blurhash={blurhash} style={StyleSheet.absoluteFill} />
      ) : null}
      <FastImage
        {...props}
        style={StyleSheet.absoluteFill}
        onLoad={(event) => {
          setLoaded(true);
          props.onLoad?.(event);
        }}
      />
    </View>
  );
}

export function VideoPlayer(props: ComponentProps<typeof Video>) {
  const focused = useIsFocused();
  const active = useAppActive();

  return (
    <Video
      {...props}
      controls={props.controls ?? true}
      paused={props.paused || !focused || !active}
      playInBackground={false}
      playWhenInactive={false}
    />
  );
}

export function AppImage(props: ComponentProps<typeof FastImage> & { blurhash?: string }) {
  return <ImageContent key={JSON.stringify(props.source)} {...props} />;
}
