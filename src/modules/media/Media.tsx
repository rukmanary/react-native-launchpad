import { useState, type ComponentProps, type ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import { Blurhash } from 'react-native-blurhash';
import Video from 'react-native-video';
import { useAppActive } from '@/shared/hooks/useAppActive';
import { useTheme } from '@/shared/theme/theme';

type ImageProps = ComponentProps<typeof FastImage> & {
  blurhash?: string;
  errorFallback?: ReactNode;
  reloadKey?: string | number;
};

const ImageContent = ({
  blurhash,
  errorFallback,
  style,
  onLoad,
  onError,
  ...props
}: ImageProps) => {
  const { colors } = useTheme();
  const [status, setStatus] = useState<'loading' | 'loaded' | 'failed'>('loading');
  const placeholder =
    status === 'loading' || (status === 'failed' && !errorFallback) ? blurhash : undefined;

  return (
    <View style={[styles.image, { backgroundColor: colors.surfaceMuted }, style]}>
      {placeholder ? (
        <Blurhash blurhash={placeholder} style={StyleSheet.absoluteFill} accessible={false} />
      ) : null}
      <FastImage
        {...props}
        style={[StyleSheet.absoluteFill, (placeholder || status === 'failed') && styles.hidden]}
        onLoad={(event) => {
          setStatus('loaded');
          onLoad?.(event);
        }}
        onError={(event) => {
          setStatus('failed');
          onError?.(event);
        }}
      />
      {status === 'failed' ? errorFallback : null}
    </View>
  );
};

export const VideoPlayer = ({ style, ...props }: ComponentProps<typeof Video>) => {
  const { colors } = useTheme();
  const focused = useIsFocused();
  const active = useAppActive();

  return (
    <Video
      {...props}
      style={[{ backgroundColor: colors.surfaceMuted }, style]}
      controls={props.controls ?? true}
      paused={props.paused || !focused || !active}
      playInBackground={false}
      playWhenInactive={false}
    />
  );
};

export const AppImage = ({ reloadKey, ...props }: ImageProps) => {
  const sources = Array.isArray(props.source) ? props.source : [props.source];
  const identity = sources.map((source) => (typeof source === 'number' ? source : source?.uri));

  return <ImageContent key={JSON.stringify([identity, reloadKey])} {...props} />;
};

const styles = StyleSheet.create({
  image: { overflow: 'hidden' },
  hidden: { opacity: 0 },
});
