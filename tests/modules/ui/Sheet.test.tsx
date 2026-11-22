import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { Sheet } from '@/modules/ui/Sheet';
import { lightTheme } from '@/shared/theme/theme';

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: jest.requireActual<typeof import('react-native')>('react-native').View,
}));

jest.mock('react-native-keyboard-controller', () => ({
  KeyboardAvoidingView: jest.requireActual<typeof import('react-native')>('react-native').View,
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');

  return {
    SafeAreaProvider: View,
    useSafeAreaInsets: () => ({ top: 24, bottom: 16, left: 4, right: 8 }),
  };
});

jest.mock('@gorhom/bottom-sheet', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');

  const BottomSheet = ({
    children,
    onClose,
    topInset,
    bottomInset,
  }: import('react').PropsWithChildren<{
    onClose: () => void;
    topInset: number;
    bottomInset?: number;
  }>) => (
    <View
      testID="native-sheet"
      onAccessibilityEscape={onClose}
      style={{ marginTop: topInset, marginBottom: bottomInset }}
    >
      {children}
    </View>
  );

  const BottomSheetView = (props: import('react-native').ViewProps) => (
    <View {...props} testID="sheet-content" />
  );

  return { __esModule: true, default: BottomSheet, BottomSheetView };
});

test('opens in an edge-to-edge modal and applies the bottom inset inside the sheet', async () => {
  const onClose = jest.fn();
  const result = await render(<Sheet open={false} onClose={onClose} />);

  expect(screen.queryByTestId('native-sheet')).toBeNull();

  await result.rerender(
    <Sheet open onClose={onClose}>
      <Text>Sheet body</Text>
    </Sheet>,
  );

  expect(screen.getByText('Sheet body')).toBeVisible();
  expect(screen.root).toHaveProp('statusBarTranslucent', true);
  expect(screen.root).toHaveProp('navigationBarTranslucent', true);
  expect(screen.getByTestId('native-sheet')).toHaveStyle({ marginTop: 24 });
  expect(screen.getByTestId('sheet-content')).toHaveStyle({
    paddingLeft: lightTheme.spacing.lg + 4,
    paddingRight: lightTheme.spacing.lg + 8,
    paddingBottom: lightTheme.spacing.lg + 16,
  });

  await result.rerender(<Sheet open={false} onClose={onClose} />);

  expect(screen.queryByTestId('native-sheet')).toBeNull();
  expect(onClose).not.toHaveBeenCalled();
});

test('requests dismissal when the sheet closes or Android Back is pressed', async () => {
  const onClose = jest.fn();

  await render(<Sheet open onClose={onClose} />);
  await fireEvent(screen.getByTestId('native-sheet'), 'accessibilityEscape');

  expect(onClose).toHaveBeenCalledTimes(1);

  const modal = screen.root;
  if (!modal) throw new Error('Expected a rendered sheet modal');

  await fireEvent(modal, 'requestClose');

  expect(onClose).toHaveBeenCalledTimes(2);
});
