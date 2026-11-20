import { render, screen, userEvent } from '@testing-library/react-native';
import { Button } from '@/shared/ui/Button';

test('button exposes its label and calls its action', async () => {
  const onPress = jest.fn();

  await render(<Button label="Continue" onPress={onPress} />);
  await userEvent.press(screen.getByRole('button', { name: 'Continue' }));
  expect(onPress).toHaveBeenCalledTimes(1);
});

test('busy button cannot submit twice', async () => {
  const onPress = jest.fn();

  await render(<Button label="Save" loading onPress={onPress} />);
  await userEvent.press(screen.getByRole('button', { name: 'Save' }));
  expect(onPress).not.toHaveBeenCalled();
});
