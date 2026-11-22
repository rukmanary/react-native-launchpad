import { Linking, StyleSheet, View } from 'react-native';
import { useEffect, useRef, useState, type PropsWithChildren } from 'react';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  usePhotoOutput,
  type CameraOutput,
  type CameraPhotoOutput,
} from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native';
import { useAppActive } from '@/shared/hooks/useAppActive';
import { useTheme } from '@/shared/theme/theme';
import { Button } from '@/shared/ui/Button';
import { AppText } from '@/shared/ui/AppText';

export const useCameraActive = (enabled = true) => {
  const active = useAppActive();
  const focused = useIsFocused();

  return enabled && focused && active;
};

type PreviewProps = PropsWithChildren<{
  active: boolean;
  outputs: CameraOutput[];
  onError: (error: unknown) => void;
  onStarted?: () => void;
  onStopped?: () => void;
}>;

export const CameraPreview = ({
  active,
  children,
  outputs,
  onError,
  onStarted,
  onStopped,
}: PreviewProps) => {
  const device = useCameraDevice('back');
  const permission = useCameraPermission();
  const { colors, spacing, radii } = useTheme();
  const [requesting, setRequesting] = useState(false);
  const requestPending = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  const askForPermission = async () => {
    if (requestPending.current) return;

    requestPending.current = true;
    setRequesting(true);

    try {
      if (permission.canRequestPermission) await permission.requestPermission();
      else await Linking.openSettings();
    } catch (error) {
      if (mounted.current) onError(error);
    } finally {
      requestPending.current = false;
      if (mounted.current) setRequesting(false);
    }
  };

  if (!permission.hasPermission)
    return (
      <View style={[styles.fallback, { gap: spacing.md }]}>
        <AppText tone="muted">Camera permission is required to use the preview.</AppText>
        <Button
          label={permission.canRequestPermission ? 'Allow camera' : 'Open settings'}
          onPress={() => void askForPermission()}
          loading={requesting}
        />
      </View>
    );

  if (!device) return <AppText tone="muted">No rear camera is available on this device.</AppText>;

  return (
    <View style={styles.container}>
      <View
        style={[styles.viewport, { backgroundColor: colors.surfaceMuted, borderRadius: radii.lg }]}
      >
        <Camera
          device={device}
          outputs={outputs}
          isActive={active}
          style={StyleSheet.absoluteFill}
          onError={onError}
          onStarted={onStarted}
          onStopped={onStopped}
        />
      </View>
      {children ? <View style={{ paddingTop: spacing.md }}>{children}</View> : null}
    </View>
  );
};

export const CameraView = ({
  onCapture,
  onError,
  enabled = true,
}: {
  onCapture: (output: CameraPhotoOutput) => Promise<void>;
  onError: (error: unknown) => void;
  enabled?: boolean;
}) => {
  const photo = usePhotoOutput({ quality: 0.85 });
  const active = useCameraActive(enabled);
  const capturing = useRef(false);
  const mounted = useRef(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  const capture = async () => {
    if (!active || !ready || capturing.current) return;

    capturing.current = true;
    setBusy(true);

    try {
      await onCapture(photo);
    } catch (error) {
      if (mounted.current) onError(error);
    } finally {
      capturing.current = false;
      if (mounted.current) setBusy(false);
    }
  };

  return (
    <CameraPreview
      active={active}
      outputs={[photo]}
      onError={onError}
      onStarted={() => setReady(true)}
      onStopped={() => setReady(false)}
    >
      <Button
        label="Take photo"
        loading={busy}
        disabled={!active || !ready}
        onPress={() => void capture()}
      />
    </CameraPreview>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 160 },
  viewport: { flex: 1, overflow: 'hidden' },
  fallback: { flex: 1, justifyContent: 'center' },
});
