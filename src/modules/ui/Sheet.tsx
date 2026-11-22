import type { ComponentProps, PropsWithChildren } from 'react';
import { Modal, Platform, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/theme/theme';

export { BottomSheetModalProvider as SheetProvider } from '@gorhom/bottom-sheet';

type SheetProps = PropsWithChildren<{ open: boolean; onClose: () => void }>;

const SheetBackdrop = (props: ComponentProps<typeof BottomSheetBackdrop>) => (
  <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
);

const SheetContent = ({ onClose, children }: Omit<SheetProps, 'open'>) => {
  const insets = useSafeAreaInsets();
  const { colors, radii, spacing } = useTheme();

  return (
    <BottomSheet
      accessible={false}
      onClose={onClose}
      enablePanDownToClose
      enableBlurKeyboardOnGesture
      topInset={insets.top}
      backgroundStyle={{
        backgroundColor: colors.surface,
        borderTopLeftRadius: radii.lg,
        borderTopRightRadius: radii.lg,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
      }}
      handleIndicatorStyle={{ backgroundColor: colors.muted }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      // Keyboard Controller resizes the sheet's host on Android.
      android_keyboardInputMode="adjustResize"
      backdropComponent={SheetBackdrop}
    >
      <BottomSheetView
        accessibilityViewIsModal
        onAccessibilityEscape={onClose}
        style={{
          paddingTop: spacing.md,
          paddingLeft: spacing.lg + insets.left,
          paddingRight: spacing.lg + insets.right,
          paddingBottom: spacing.lg + insets.bottom,
          gap: spacing.md,
        }}
      >
        {children}
      </BottomSheetView>
    </BottomSheet>
  );
};

export const Sheet = ({ open, onClose, children }: SheetProps) => (
  <Modal
    visible={open}
    transparent
    presentationStyle="overFullScreen"
    statusBarTranslucent
    navigationBarTranslucent
    onRequestClose={onClose}
  >
    {open ? (
      <GestureHandlerRootView style={styles.fill}>
        <SafeAreaProvider>
          <KeyboardAvoidingView
            behavior="height"
            enabled={Platform.OS === 'android'}
            style={styles.fill}
          >
            <SheetContent onClose={onClose}>{children}</SheetContent>
          </KeyboardAvoidingView>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    ) : null}
  </Modal>
);

export const SheetTextField = (props: ComponentProps<typeof BottomSheetTextInput>) => {
  const { colors, radii, spacing } = useTheme();

  return (
    <BottomSheetTextInput
      placeholderTextColor={colors.muted}
      {...props}
      style={[
        {
          minHeight: 48,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radii.md,
          padding: spacing.md,
          color: colors.text,
          backgroundColor: colors.surface,
        },
        props.style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
