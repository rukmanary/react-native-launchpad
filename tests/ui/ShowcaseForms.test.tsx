import { useState, type ReactNode } from 'react';
import { render, screen, userEvent } from '@testing-library/react-native';
import { useForm } from 'react-hook-form';
import { darkTheme, lightTheme, ThemeProvider } from '@/shared/theme/theme';
import { NetworkErrorModal } from '@/shared/ui/Dialogs';
import { Dropdown } from '@/shared/ui/Dropdown';
import { Form } from '@/shared/ui/Form';
import { SearchBar } from '@/shared/ui/SearchBar';
import { FormField, TextField } from '@/shared/ui/TextField';

jest.mock('@/shared/ui/AppModal', () => ({
  AppModal: ({ open, children }: { open: boolean; children: ReactNode }) =>
    open ? children : null,
}));

jest.mock('@/shared/ui/Screen', () => ({
  FormScreen: ({ children }: { children: ReactNode }) => children,
}));

jest.mock('@/shared/ui/Icon', () => ({ Icon: () => null }));

test('text field uses light fallback and updates when wrapped with a theme', async () => {
  const view = await render(<TextField label="Name" />);

  expect(screen.getByLabelText('Name')).toHaveStyle({ color: lightTheme.colors.text });

  await view.rerender(
    <ThemeProvider theme={darkTheme}>
      <TextField label="Name" />
    </ThemeProvider>,
  );

  expect(screen.getByLabelText('Name')).toHaveStyle({ color: darkTheme.colors.text });
});

test('connection dialog offers retry only when the caller supplies it', async () => {
  const onClose = jest.fn();
  const onRetry = jest.fn();
  const view = await render(<NetworkErrorModal open onClose={onClose} />);

  expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
  await userEvent.press(screen.getByRole('button', { name: 'Close' }));
  expect(onClose).toHaveBeenCalledTimes(1);

  await view.rerender(<NetworkErrorModal open onClose={onClose} onRetry={onRetry} />);
  await userEvent.press(screen.getByRole('button', { name: 'Try again' }));
  expect(onRetry).toHaveBeenCalledTimes(1);
});

test('dropdown selects a value and search clear updates its controlled value', async () => {
  const onChange = jest.fn();
  const Controls = () => {
    const [search, setSearch] = useState('profile');
    return (
      <>
        <Dropdown
          label="Priority"
          options={[{ value: 'high', label: 'High' }]}
          value={null}
          onChange={onChange}
        />
        <SearchBar value={search} onChangeText={setSearch} />
      </>
    );
  };

  await render(<Controls />);
  await userEvent.press(screen.getByRole('combobox', { name: 'Priority' }));
  await userEvent.press(screen.getByRole('radio', { name: 'High' }));
  expect(onChange).toHaveBeenCalledWith('high');
  expect(screen.queryByRole('radio', { name: 'High' })).toBeNull();

  await userEvent.press(screen.getByRole('button', { name: 'Clear search' }));
  expect(screen.getByDisplayValue('')).toBeOnTheScreen();
});

test('form surfaces failures from the submit handler to the caller', async () => {
  const failure = new Error('Unavailable');
  const onSubmitError = jest.fn();
  const onSubmit = jest.fn(async () => {
    throw failure;
  });
  const DemoForm = () => {
    const form = useForm({ defaultValues: { name: 'Sam' } });
    return (
      <Form form={form} onSubmit={onSubmit} onSubmitError={onSubmitError}>
        <FormField control={form.control} name="name" label="Name" />
      </Form>
    );
  };

  await render(<DemoForm />);
  await userEvent.press(screen.getByRole('button', { name: 'Submit' }));

  expect(onSubmit).toHaveBeenCalledWith({ name: 'Sam' }, undefined);
  expect(onSubmitError).toHaveBeenCalledWith(failure);
});
