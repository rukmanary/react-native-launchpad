import type { PropsWithChildren } from 'react';
import { render, screen, userEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AppTabs } from '@/app/navigation/Tabs';
import { HomeScreen } from '@/features/home';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/shared/ui/Icon', () => ({ Icon: () => null }));

jest.mock('@/shared/ui/Screen', () => ({
  Screen: ({ children }: PropsWithChildren) => {
    const { View } = jest.requireActual<typeof import('react-native')>('react-native');
    return <View>{children}</View>;
  },
}));

const tabs = [
  { button: 'tab-component', screen: 'component-title' },
  { button: 'tab-api', screen: 'api-title' },
  { button: 'tab-profile', screen: 'profile-title' },
];

test('shows Home first and mounts each placeholder when its tab is opened', async () => {
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
