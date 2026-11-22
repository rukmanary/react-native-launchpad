import { useState } from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { ThemedText } from '@/shared/ui/AppText';
import { useTheme } from '@/shared/theme/theme';

type Props = { name: string; source?: ImageSourcePropType; size?: number };

export const Avatar = ({ name, source, size = 48 }: Props) => {
  const { colors } = useTheme();
  const [failedKey, setFailedKey] = useState<string | number | undefined>();
  const sourceKey =
    typeof source === 'number'
      ? source
      : source && 'map' in source
        ? source.map(({ uri }) => uri).join(' ')
        : source?.uri;
  const showImage = source && sourceKey !== undefined && sourceKey !== failedKey;
  const initials = name
    .trim()
    .split(/\s+/u)
    .slice(0, 2)
    .map((part) => Array.from(part)[0] ?? '')
    .join('')
    .toLocaleUpperCase();
  const diameter = Number.isFinite(size) ? Math.max(1, size) : 48;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={name.trim() || 'Avatar'}
      style={[
        styles.avatar,
        {
          width: diameter,
          height: diameter,
          borderRadius: diameter / 2,
          backgroundColor: colors.primaryMuted,
        },
      ]}
    >
      {showImage ? (
        <Image
          key={sourceKey}
          source={source}
          resizeMode="cover"
          style={styles.image}
          onError={() => setFailedKey(sourceKey)}
        />
      ) : (
        <ThemedText variant="caption" tone="primary" style={{ fontWeight: '700' }}>
          {initials || '?'}
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: { justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
});
