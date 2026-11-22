import type { PropsWithChildren } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useTheme } from '@/shared/theme/theme';
import { Screen, ScreenInsetsProvider } from '@/shared/ui/Screen';

export type AppModalProps = PropsWithChildren<{
  open: boolean;
  onClose: () => void;
  variant?: 'fullscreen' | 'dialog';
  dismissOnBackdrop?: boolean;
  testID?: string;
}>;

export const AppModal = ({
  open,
  onClose,
  variant = 'fullscreen',
  dismissOnBackdrop = false,
  testID,
  children,
}: AppModalProps) => {
  const { colors, radii, spacing } = useTheme();
  const dialog = variant === 'dialog';

  return (
    <Modal
      visible={open}
      transparent={dialog}
      animationType={dialog ? 'fade' : 'slide'}
      presentationStyle={dialog ? 'overFullScreen' : 'fullScreen'}
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <SafeAreaProvider>
        <ScreenInsetsProvider topHandled={false} bottomHandled={false}>
          {dialog ? (
            <View style={[styles.fill, { backgroundColor: colors.overlay }]}>
              {dismissOnBackdrop ? (
                <Pressable accessible={false} onPress={onClose} style={StyleSheet.absoluteFill} />
              ) : null}
              <SafeAreaView pointerEvents="box-none" style={styles.dialogArea}>
                <View
                  accessibilityViewIsModal
                  onAccessibilityEscape={onClose}
                  style={[
                    styles.panel,
                    {
                      margin: spacing.md,
                      borderRadius: radii.lg,
                      backgroundColor: colors.surface,
                    },
                  ]}
                  testID={testID}
                >
                  <ScrollView
                    bounces={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
                  >
                    {children}
                  </ScrollView>
                </View>
              </SafeAreaView>
            </View>
          ) : (
            <KeyboardProvider>
              <Screen topInset>
                <View
                  accessibilityViewIsModal
                  onAccessibilityEscape={onClose}
                  style={styles.fill}
                  testID={testID}
                >
                  {children}
                </View>
              </Screen>
            </KeyboardProvider>
          )}
        </ScreenInsetsProvider>
      </SafeAreaProvider>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  dialogArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  panel: { width: '90%', maxWidth: 480, maxHeight: '90%', flexShrink: 1 },
});
