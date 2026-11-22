import { useState } from 'react';
import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import { darkTheme, lightTheme, ThemeProvider } from '@/shared/theme/theme';
import { ThemedText } from '@/shared/ui/AppText';
import { Expandable } from '@/shared/ui/Expandable';
import { ProgressBar } from '@/shared/ui/Feedback';
import { Checkbox, RadioGroup } from '@/shared/ui/SelectionControl';
import { Slider } from '@/shared/ui/Slider';
import { ThemedView } from '@/shared/ui/ThemedView';

test('text and surfaces use light tokens outside a provider and follow an explicit theme', async () => {
  const sample = (
    <ThemedView testID="sample-surface">
      <ThemedText>Example</ThemedText>
    </ThemedView>
  );
  const { rerender } = await render(sample);

  expect(screen.getByText('Example')).toHaveStyle({ color: lightTheme.colors.text });
  expect(screen.getByTestId('sample-surface')).toHaveStyle({
    backgroundColor: lightTheme.colors.surface,
  });

  await rerender(<ThemeProvider theme={darkTheme}>{sample}</ThemeProvider>);

  expect(screen.getByText('Example')).toHaveStyle({ color: darkTheme.colors.text });
  expect(screen.getByTestId('sample-surface')).toHaveStyle({
    backgroundColor: darkTheme.colors.surface,
  });
});

const selections = [
  { label: 'Compact', value: 'compact' },
  { label: 'Comfortable', value: 'comfortable' },
];

const SelectionExample = () => {
  const [checked, setChecked] = useState(false);
  const [density, setDensity] = useState('compact');

  return (
    <>
      <Checkbox label="Remember" checked={checked} onCheckedChange={setChecked} />
      <RadioGroup options={selections} value={density} onValueChange={setDensity} />
    </>
  );
};

test('controlled checkbox and radio report the selected accessible state', async () => {
  await render(<SelectionExample />);

  await userEvent.press(screen.getByRole('checkbox', { name: 'Remember' }));
  await userEvent.press(screen.getByRole('radio', { name: 'Comfortable' }));

  expect(screen.getByRole('checkbox', { name: 'Remember', checked: true })).toBeOnTheScreen();
  expect(screen.getByRole('radio', { name: 'Comfortable', checked: true })).toBeOnTheScreen();
  expect(screen.getByRole('radio', { name: 'Compact', checked: false })).toBeOnTheScreen();
});

const ExpandableExample = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Expandable title="Details" expanded={expanded} onExpandedChange={setExpanded}>
      <ThemedText>Additional information</ThemedText>
    </Expandable>
  );
};

test('expandable content is mounted when its control expands', async () => {
  await render(<ExpandableExample />);
  expect(screen.queryByText('Additional information')).toBeNull();

  await userEvent.press(screen.getByRole('button', { name: 'Details', expanded: false }));

  expect(screen.getByText('Additional information')).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Details', expanded: true })).toBeOnTheScreen();
});

test('slider supports accessible steps and determinate progress clamps out-of-range values', async () => {
  const onValueChange = jest.fn();
  await render(
    <>
      <Slider label="Volume" value={25} step={5} onValueChange={onValueChange} />
      <ProgressBar label="Upload" value={1.2} />
    </>,
  );

  const slider = screen.getByRole('adjustable', { name: 'Volume' });
  await fireEvent(slider, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
  await fireEvent(slider, 'layout', { nativeEvent: { layout: { width: 220 } } });
  await fireEvent(slider, 'responderGrant', { nativeEvent: { locationX: 110 } });
  await fireEvent(slider, 'responderMove', { nativeEvent: { locationX: 150 } });

  expect(onValueChange.mock.calls).toEqual([[30], [50], [70]]);
  expect(slider).toHaveAccessibilityValue({ min: 0, max: 100, now: 25 });
  expect(screen.getByRole('progressbar', { name: 'Upload' })).toHaveAccessibilityValue({
    now: 100,
  });
});
