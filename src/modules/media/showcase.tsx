import { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';

import sampleImage from '@/assets/showcase/media/sample.png';
import sampleVideo from '@/assets/showcase/media/motion.mp4';
import { AudioShowcase } from '@/modules/media/AudioShowcase';
import { AppImage, VideoPlayer } from '@/modules/media/Media';
import { DocumentPicker, ImageCropPicker, ImagePicker } from '@/modules/media/PickerButtons';
import { useTheme } from '@/shared/theme/theme';
import { AppText } from '@/shared/ui/AppText';
import { Button } from '@/shared/ui/Button';
import { Screen } from '@/shared/ui/Screen';

const blurhash = 'LWDKfiNgxvxV?dNfWAs+IToIRiWX';
const videoSource = { uri: Image.resolveAssetSource(sampleVideo)?.uri };

export const MediaShowcaseScreen = () => {
  const { colors, radii, spacing } = useTheme();
  const [preview, setPreview] = useState<string>();
  const [message, setMessage] = useState('Choose a document or an image to try a picker.');
  const [videoVisible, setVideoVisible] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const setPickerError = () => setMessage('The picker could not open or process that file.');
  const setPickerCancelled = () => setMessage('Selection cancelled.');
  const mediaSurface = {
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  } as const;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <View style={{ gap: spacing.sm }}>
          <AppText variant="heading">Image and Blurhash</AppText>
          <AppImage
            source={sampleImage}
            accessibilityLabel="Illustration of mountains at sunset"
            accessible
            blurhash={blurhash}
            style={[styles.preview, mediaSurface]}
            errorFallback={<AppText tone="danger">Image could not be loaded.</AppText>}
          />
        </View>
        <View style={{ gap: spacing.sm }}>
          <AppText variant="heading">Document and image pickers</AppText>
          <DocumentPicker
            onResult={(file) => setMessage(`Selected ${file.name ?? 'a document'}.`)}
            onCancel={setPickerCancelled}
            onError={setPickerError}
          />
          <ImagePicker
            onResult={({ uri }) => {
              setPreview(uri);
              setMessage('Image selected. You can crop it below.');
            }}
            onCancel={setPickerCancelled}
            onError={setPickerError}
          />
          {preview && (
            <AppImage
              source={{ uri: preview }}
              accessibilityLabel="Selected image"
              accessible
              style={[styles.preview, mediaSurface]}
              errorFallback={<AppText tone="danger">Preview could not be loaded.</AppText>}
            />
          )}
          <ImageCropPicker
            path={preview}
            onResult={({ path }) => {
              setPreview(path.startsWith('/') ? `file://${path}` : path);
              setMessage('Cropped image is ready to preview.');
            }}
            onCancel={setPickerCancelled}
            onError={setPickerError}
          />
          <AppText tone="muted" accessibilityLiveRegion="polite">
            {message}
          </AppText>
        </View>
        <View style={{ gap: spacing.sm }}>
          <AppText variant="heading">Audio player</AppText>
          <AudioShowcase />
        </View>
        <View style={{ gap: spacing.sm }}>
          <AppText variant="heading">Video player</AppText>
          <Button
            label={videoVisible ? 'Close video' : 'Play sample video'}
            onPress={() => {
              setVideoVisible((visible) => !visible);
              setVideoFailed(false);
            }}
          />
          {videoVisible && (
            <View style={[styles.preview, mediaSurface]}>
              <VideoPlayer
                accessibilityLabel="Silent animation of a moving circle"
                source={videoSource}
                resizeMode="contain"
                style={StyleSheet.absoluteFill}
                onError={() => setVideoFailed(true)}
              />
            </View>
          )}
          {videoFailed && <AppText tone="danger">The bundled video could not be played.</AppText>}
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  preview: { aspectRatio: 16 / 9 },
});
