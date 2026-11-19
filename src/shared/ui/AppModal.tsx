import type { PropsWithChildren } from 'react';
import { Modal, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { Screen } from './Screen';
export function AppModal({
  open,
  onClose,
  children,
}: PropsWithChildren<{ open: boolean; onClose: () => void }>) {
  return (
    <Modal
      visible={open}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaProvider>
        <KeyboardProvider>
          <Screen topInset>
            <View accessibilityViewIsModal style={{ flex: 1 }}>
              {children}
            </View>
          </Screen>
        </KeyboardProvider>
      </SafeAreaProvider>
    </Modal>
  );
}
