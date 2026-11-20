import { useEffect, useRef, type PropsWithChildren, type ComponentProps } from 'react';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
  BottomSheetTextInput,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export { BottomSheetModalProvider as SheetProvider };

export function Sheet({
  open,
  onClose,
  children,
}: PropsWithChildren<{ open: boolean; onClose: () => void }>) {
  const ref = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (open) ref.current?.present();
    else ref.current?.dismiss();
  }, [open]);

  return (
    <BottomSheetModal
      ref={ref}
      onDismiss={onClose}
      enablePanDownToClose
      topInset={insets.top}
      bottomInset={insets.bottom}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
      )}
    >
      <BottomSheetView style={{ padding: 24, paddingBottom: 24 + insets.bottom }}>
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
}

export function SheetTextField(props: ComponentProps<typeof BottomSheetTextInput>) {
  return (
    <BottomSheetTextInput
      {...props}
      style={[
        { minHeight: 48, borderWidth: 1, borderColor: '#CDD5E0', borderRadius: 10, padding: 12 },
        props.style,
      ]}
    />
  );
}
