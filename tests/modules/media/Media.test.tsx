import { fireEvent, render, screen } from '@testing-library/react-native';
import { AppImage } from '@/modules/media/Media';
import { AppText } from '@/shared/ui/AppText';

jest.mock('@react-navigation/native', () => ({ useIsFocused: () => true }));
jest.mock('react-native-video', () => () => null);
jest.mock('react-native-fast-image', () => {
  const { View } = jest.requireActual('react-native');

  return View;
});
jest.mock('react-native-blurhash', () => {
  const { View } = jest.requireActual('react-native');
  const Blurhash = () => <View testID="blurhash-placeholder" />;

  return { Blurhash };
});

const source = { uri: 'https://example.com/image.png' };
const blurhash = 'LWDKfiNgxvxV?dNfWAs+IToIRiWX';

describe('AppImage', () => {
  it('removes the placeholder after the image loads', async () => {
    await render(<AppImage source={source} blurhash={blurhash} testID="image" />);
    expect(screen.getByTestId('blurhash-placeholder')).toBeOnTheScreen();

    await fireEvent(screen.getByTestId('image'), 'load');

    expect(screen.queryByTestId('blurhash-placeholder')).toBeNull();
  });

  it('shows a custom fallback and resets it for a different source', async () => {
    const { rerender } = await render(
      <AppImage
        source={source}
        blurhash={blurhash}
        testID="image"
        errorFallback={<AppText>Image unavailable</AppText>}
      />,
    );

    await fireEvent(screen.getByTestId('image'), 'error');

    expect(screen.getByText('Image unavailable')).toBeOnTheScreen();
    expect(screen.queryByTestId('blurhash-placeholder')).toBeNull();

    await rerender(
      <AppImage
        source={{ uri: 'https://example.com/other.png' }}
        blurhash={blurhash}
        testID="image"
        errorFallback={<AppText>Image unavailable</AppText>}
      />,
    );

    expect(screen.queryByText('Image unavailable')).toBeNull();
    expect(screen.getByTestId('blurhash-placeholder')).toBeOnTheScreen();
  });
});
