import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useTheme } from '@/shared/theme/theme';
import { AppModal } from '@/shared/ui/AppModal';
import { AppText } from '@/shared/ui/AppText';
import { Button } from '@/shared/ui/Button';
import { AlertDialog, ConfirmDialog, NetworkErrorModal } from '@/shared/ui/Dialogs';
import { Screen } from '@/shared/ui/Screen';
import { Snackbar, Toast } from '@/shared/ui/Snackbar';

type Overlay = 'modal' | 'alert' | 'confirm' | 'connection' | 'connection-retry';

export const OverlaysShowcaseScreen = () => {
  const { spacing } = useTheme();
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const close = () => setOverlay(null);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <Button label="Open full-screen modal" onPress={() => setOverlay('modal')} />
        <Button label="Open custom alert" onPress={() => setOverlay('alert')} />
        <Button label="Open confirmation" onPress={() => setOverlay('confirm')} />
        <Button label="Open connection dialog" onPress={() => setOverlay('connection')} />
        <Button
          label="Open connection dialog with retry"
          onPress={() => setOverlay('connection-retry')}
        />
        <Button label="Show toast" onPress={() => setToastMessage('Draft saved locally.')} />
        <Button label="Show snackbar" onPress={() => setSnackbar(true)} />
        {confirmed ? (
          <AppText accessibilityLiveRegion="polite">The demo action was confirmed.</AppText>
        ) : null}
      </ScrollView>
      {toastMessage || snackbar ? (
        <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: spacing.sm }}>
          <Toast
            open={toastMessage !== null}
            message={toastMessage ?? ''}
            onDismiss={() => setToastMessage(null)}
          />
          <Snackbar
            open={snackbar}
            message="Demo item archived."
            onDismiss={() => setSnackbar(false)}
            action={{ label: 'Undo', onPress: () => setSnackbar(false) }}
          />
        </View>
      ) : null}
      <AppModal open={overlay === 'modal'} onClose={close}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
          <AppText variant="title">Full-screen modal</AppText>
          <Button label="Close modal" onPress={close} />
        </ScrollView>
      </AppModal>
      <AlertDialog
        open={overlay === 'alert'}
        title="Draft saved"
        message="You can continue editing your draft."
        onClose={close}
      />
      <ConfirmDialog
        open={overlay === 'confirm'}
        title="Confirm demo action"
        message="Confirm to update the status shown below the examples."
        onClose={close}
        onConfirm={() => {
          setConfirmed(true);
          close();
        }}
      />
      <NetworkErrorModal
        open={overlay === 'connection' || overlay === 'connection-retry'}
        onClose={close}
        onRetry={
          overlay === 'connection-retry'
            ? () => {
                close();
                setToastMessage('Retry requested.');
              }
            : undefined
        }
      />
    </Screen>
  );
};
