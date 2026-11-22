import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { CameraView } from '@/modules/camera/CameraView';
import { QrScanner, BarcodeScanner, type ScannedCode } from '@/modules/camera/CodeScanners';
import { useTheme } from '@/shared/theme/theme';
import { AppText } from '@/shared/ui/AppText';
import { Button } from '@/shared/ui/Button';
import { Screen } from '@/shared/ui/Screen';

type Mode = 'photo' | 'qr' | 'barcode';

const modes: readonly { id: Mode; label: string }[] = [
  { id: 'photo', label: 'Photo' },
  { id: 'qr', label: 'QR code' },
  { id: 'barcode', label: 'Barcode' },
];

export const CameraShowcaseScreen = () => {
  const { spacing } = useTheme();
  const [mode, setMode] = useState<Mode>('photo');
  const [code, setCode] = useState<ScannedCode>();
  const [status, setStatus] = useState('Capture a photo or choose a scanner.');
  const [error, setError] = useState<string>();
  const photoAttempt = useRef(0);
  const Scanner = mode === 'qr' ? QrScanner : BarcodeScanner;

  useEffect(
    () => () => {
      photoAttempt.current += 1;
    },
    [],
  );

  const changeMode = (next: Mode) => {
    if (next === mode) return;

    photoAttempt.current += 1;
    setMode(next);
    setCode(undefined);
    setError(undefined);
    setStatus(next === 'photo' ? 'Ready to capture a photo.' : 'Point the camera at a code.');
  };

  const reportError = (cause: unknown) => {
    setError(cause instanceof Error ? cause.message : 'The camera could not complete this action.');
  };

  return (
    <Screen style={{ padding: spacing.lg, gap: spacing.md }}>
      <AppText variant="title">Camera and scanners</AppText>
      <View style={[styles.modes, { gap: spacing.sm }]}>
        {modes.map(({ id, label }) => (
          <Button
            key={id}
            label={label}
            variant={mode === id ? 'primary' : 'secondary'}
            onPress={() => changeMode(id)}
          />
        ))}
      </View>
      {mode === 'photo' ? (
        <CameraView
          onError={reportError}
          onCapture={async (output) => {
            const attempt = ++photoAttempt.current;
            const photo = await output.capturePhoto({}, {});

            try {
              if (photoAttempt.current !== attempt) return;

              setStatus(`Captured ${photo.width} × ${photo.height} pixels.`);
              setError(undefined);
            } finally {
              photo.dispose();
            }
          }}
        />
      ) : (
        <Scanner key={mode} enabled={!code} onScan={setCode} onError={reportError} />
      )}
      {code ? (
        <>
          <AppText accessibilityLiveRegion="polite" selectable numberOfLines={3}>
            {code.format}: {code.value}
          </AppText>
          <Button label="Scan another" onPress={() => setCode(undefined)} />
        </>
      ) : (
        <AppText tone="muted" accessibilityLiveRegion="polite">
          {status}
        </AppText>
      )}
      {error ? (
        <AppText tone="danger" accessibilityRole="alert" numberOfLines={3}>
          {error}
        </AppText>
      ) : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  modes: { flexDirection: 'row', flexWrap: 'wrap' },
});
