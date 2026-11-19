import { Text, View, StyleSheet, Linking } from 'react-native';
import { useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  usePhotoOutput,
  type CameraPhotoOutput,
} from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native';
import { useAppActive } from '../../shared/hooks/useAppActive';
import { Button } from '../../shared/ui/Button';
export function CameraView({
  onCapture,
  onError,
}: {
  onCapture: (output: CameraPhotoOutput) => Promise<void>;
  onError: (error: unknown) => void;
}) {
  const device = useCameraDevice('back');
  const permission = useCameraPermission();
  const photo = usePhotoOutput({ quality: 0.85 });
  const active = useAppActive();
  const focused = useIsFocused();
  const insets = useSafeAreaInsets();
  const capturing = useRef(false);
  const [busy, setBusy] = useState(false);
  if (!permission.hasPermission)
    return (
      <Button
        label={permission.canRequestPermission ? 'Allow camera' : 'Open settings'}
        onPress={() => {
          void (
            permission.canRequestPermission
              ? permission.requestPermission()
              : Linking.openSettings()
          ).catch(onError);
        }}
      />
    );
  if (!device) return <Text>No camera available</Text>;
  return (
    <View style={{ flex: 1 }}>
      <Camera
        device={device}
        outputs={[photo]}
        isActive={active && focused}
        style={StyleSheet.absoluteFill}
        onError={onError}
      />
      <View
        style={{
          position: 'absolute',
          bottom: insets.bottom + 24,
          left: insets.left + 24,
          right: insets.right + 24,
        }}
      >
        <Button
          label="Take photo"
          loading={busy}
          disabled={!active || !focused}
          onPress={() => {
            if (capturing.current) return;
            capturing.current = true;
            setBusy(true);
            void Promise.resolve()
              .then(() => onCapture(photo))
              .catch(onError)
              .finally(() => {
                capturing.current = false;
                setBusy(false);
              });
          }}
        />
      </View>
    </View>
  );
}
