import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { darkTheme, lightTheme, ThemeProvider } from '@/shared/theme/theme';
import { ThemedText } from '@/shared/ui/AppText';
import { ScreenInsetsProvider, useScreenInsets } from '@/shared/ui/Screen';

jest.mock('react-native-keyboard-controller', () => ({}));

const InsetsProbe = () => {
  const { top, right, bottom, left } = useScreenInsets();

  return <Text>{`${top},${right},${bottom},${left}`}</Text>;
};

test('ThemedText uses light tokens without a provider and responds to an explicit theme', async () => {
  const result = await render(<ThemedText testID="themed">Body</ThemedText>);

  expect(screen.getByTestId('themed')).toHaveStyle({ color: lightTheme.colors.text });

  await result.rerender(
    <ThemeProvider theme={darkTheme}>
      <ThemedText testID="themed">Body</ThemedText>
    </ThemeProvider>,
  );

  expect(screen.getByTestId('themed')).toHaveStyle({ color: darkTheme.colors.text });
});

test('nested navigators consume each inset once and an independent surface can reset ownership', async () => {
  await render(
    <SafeAreaInsetsContext.Provider value={{ top: 24, right: 8, bottom: 16, left: 4 }}>
      <InsetsProbe />
      <ScreenInsetsProvider topHandled>
        <InsetsProbe />
        <ScreenInsetsProvider bottomHandled>
          <InsetsProbe />
          <ScreenInsetsProvider topHandled={false} bottomHandled={false}>
            <InsetsProbe />
          </ScreenInsetsProvider>
        </ScreenInsetsProvider>
      </ScreenInsetsProvider>
    </SafeAreaInsetsContext.Provider>,
  );

  expect(screen.getAllByText('24,8,16,4')).toHaveLength(2);
  expect(screen.getByText('0,8,16,4')).toBeOnTheScreen();
  expect(screen.getByText('0,8,0,4')).toBeOnTheScreen();
});
