import { render, screen, userEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Button } from '../../src/shared/ui/Button';
import { StateProvider, useAppLanguage } from '../../src/app/store/presets/recoil';

jest.mock('../../src/core/storage/preferences', () => ({
  preferences: { getString: jest.fn(), set: jest.fn() },
}));
jest.mock('../../src/app/providers/i18n', () => ({
  i18n: { language: 'id', changeLanguage: jest.fn() },
}));

function LanguageControl() {
  const { language, setLanguage } = useAppLanguage();
  return (
    <>
      <Text>{language}</Text>
      <Button label="Switch to English" onPress={() => setLanguage('en')} />
    </>
  );
}

test('Recoil updates the shared language preference under React 19', async () => {
  await render(
    <StateProvider>
      <LanguageControl />
    </StateProvider>,
  );
  expect(screen.getByText('id')).toBeOnTheScreen();
  await userEvent.press(screen.getByRole('button', { name: 'Switch to English' }));
  expect(screen.getByText('en')).toBeOnTheScreen();
});
