import { View } from 'react-native';
import { useTheme } from '@/shared/theme/theme';
import { AppModal } from '@/shared/ui/AppModal';
import { AppText } from '@/shared/ui/AppText';
import { Button } from '@/shared/ui/Button';

type DialogProps = {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
};

type DialogAction = { label: string; onPress: () => void; busy?: boolean };

const Dialog = ({
  open,
  title,
  message,
  onClose,
  closeLabel,
  action,
}: DialogProps & { closeLabel: string; action?: DialogAction }) => {
  const { spacing } = useTheme();
  const busy = action?.busy ?? false;
  const dismiss = () => {
    if (!busy) onClose();
  };

  return (
    <AppModal open={open} onClose={dismiss} variant="dialog">
      <AppText variant="heading">{title}</AppText>
      <AppText tone="muted">{message}</AppText>
      <View style={{ gap: spacing.sm }}>
        {action ? <Button label={action.label} onPress={action.onPress} loading={busy} /> : null}
        <Button
          label={closeLabel}
          onPress={dismiss}
          variant={action ? 'secondary' : 'primary'}
          disabled={busy}
        />
      </View>
    </AppModal>
  );
};

export const AlertDialog = ({
  dismissLabel = 'OK',
  ...props
}: DialogProps & { dismissLabel?: string }) => <Dialog {...props} closeLabel={dismissLabel} />;

export const ConfirmDialog = ({
  onConfirm,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirming = false,
  ...props
}: DialogProps & {
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirming?: boolean;
}) => (
  <Dialog
    {...props}
    closeLabel={cancelLabel}
    action={{ label: confirmLabel, onPress: onConfirm, busy: confirming }}
  />
);

export const NetworkErrorModal = ({
  title = 'Connection problem',
  message = 'Check your connection and try again.',
  dismissLabel = 'Close',
  retryLabel = 'Try again',
  retrying = false,
  onRetry,
  ...props
}: Omit<DialogProps, 'title' | 'message'> & {
  title?: string;
  message?: string;
  dismissLabel?: string;
  retryLabel?: string;
  retrying?: boolean;
  onRetry?: () => void;
}) => (
  <Dialog
    {...props}
    title={title}
    message={message}
    closeLabel={dismissLabel}
    action={onRetry ? { label: retryLabel, onPress: onRetry, busy: retrying } : undefined}
  />
);
