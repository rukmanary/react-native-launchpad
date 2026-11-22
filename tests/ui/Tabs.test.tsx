import type { PropsWithChildren } from 'react';
import { render, screen, userEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AppTabs } from '@/app/navigation/Tabs';
import { HomeScreen } from '@/features/home';
import { darkTheme, lightTheme } from '@/shared/theme/theme';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/shared/ui/Icon', () => ({ Icon: () => null }));
jest.mock('react-native-keyboard-controller', () => ({}));

jest.mock('@/shared/ui/Screen', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  const Screen = ({ children }: PropsWithChildren) => <View>{children}</View>;

  return {
    ScreenInsetsProvider: ({ children }: PropsWithChildren) => <>{children}</>,
    Screen,
    FormScreen: Screen,
  };
});

const tabs = [
  { button: 'tab-component', screen: 'component-title' },
  { button: 'tab-api', screen: 'api-title' },
  { button: 'tab-profile', screen: 'profile-title' },
];

test('shows Home first and mounts each tab screen when opened', async () => {
  await render(
    <NavigationContainer>
      <AppTabs />
    </NavigationContainer>,
  );

  expect(screen.getByTestId('home-title')).toBeOnTheScreen();

  for (const { button, screen: title } of tabs) {
    expect(screen.queryByTestId(title, { includeHiddenElements: true })).toBeNull();

    await userEvent.press(screen.getByTestId(button));

    expect(screen.getByTestId(title)).toBeOnTheScreen();
  }

  await userEvent.press(screen.getByTestId('tab-home'));

  expect(screen.getByTestId('home-title')).toBeOnTheScreen();
});

test('lists component names and renders interactive foundations in the Component tab', async () => {
  await render(
    <NavigationContainer>
      <AppTabs />
    </NavigationContainer>,
  );

  await userEvent.press(screen.getByTestId('tab-component'));

  for (const name of [
    'Floating Button',
    'Confirm Dialog',
    'FlashList with 1,000 searchable items',
    'Bottom Sheet',
    'Image Crop Picker',
    'WebView',
    'Graphic View',
    'QR Scanner',
    'Map View',
  ]) {
    expect(screen.getByText(name)).toBeOnTheScreen();
  }

  const checkbox = screen.getByRole('checkbox', { name: 'Remember selection' });
  await userEvent.press(checkbox);

  expect(
    screen.getByRole('checkbox', { name: 'Remember selection', checked: true }),
  ).toBeOnTheScreen();
  expect(screen.getByTestId('component-title')).toBeOnTheScreen();
});

test('applies the catalog theme to both inline examples and dedicated demos', async () => {
  await render(
    <NavigationContainer>
      <AppTabs />
    </NavigationContainer>,
  );

  await userEvent.press(screen.getByTestId('tab-component'));

  expect(screen.getByTestId('component-title')).toHaveStyle({ color: lightTheme.colors.text });

  await userEvent.press(screen.getByRole('button', { name: 'Preview dark theme' }));

  expect(screen.getByText('Themed text on a themed view')).toHaveStyle({
    color: darkTheme.colors.text,
  });

  await userEvent.press(screen.getByRole('button', { name: 'Open Forms and search' }));

  expect(await screen.findByText('Form and text fields')).toHaveStyle({
    color: darkTheme.colors.text,
  });
});

test('Home delegates its actions through callbacks without a navigator', async () => {
  const onOpenForm = jest.fn();
  const onOpenCatalog = jest.fn();
  const onOpenStarterKit = jest.fn();

  await render(
    <HomeScreen
      onOpenForm={onOpenForm}
      onOpenCatalog={onOpenCatalog}
      onOpenStarterKit={onOpenStarterKit}
    />,
  );

  await userEvent.press(screen.getByRole('button', { name: 'form' }));
  await userEvent.press(screen.getByRole('button', { name: 'catalog' }));
  await userEvent.press(screen.getByRole('button', { name: 'UI starter kit' }));

  expect(onOpenForm).toHaveBeenCalledTimes(1);
  expect(onOpenCatalog).toHaveBeenCalledTimes(1);
  expect(onOpenStarterKit).toHaveBeenCalledTimes(1);
});
