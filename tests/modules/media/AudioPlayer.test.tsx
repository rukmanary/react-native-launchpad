import { act, fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { AudioPlayer } from '@/modules/media/AudioPlayer';
import { createAudioPlayer } from '@/modules/media/audio';

let mockFocused = true;

jest.mock('@react-navigation/native', () => ({ useIsFocused: () => mockFocused }));
jest.mock('@/shared/hooks/useAppActive', () => ({ useAppActive: () => true }));
jest.mock('@/shared/ui/Icon', () => ({ Icon: () => null }));
jest.mock('@/shared/ui/AppModal', () => ({
  AppModal: ({ open, children }: { open: boolean; children: ReactNode }) =>
    open ? children : null,
}));
jest.mock('@/modules/media/audio', () => ({ createAudioPlayer: jest.fn() }));

const tracks = [
  { file: 'stillwater.m4a', title: 'Stillwater' },
  { file: 'amber-tide.m4a', title: 'Amber Tide' },
];

const testEngine = () => {
  let position = 0;
  let finish: ((completed: boolean) => void) | undefined;

  const engine = {
    ready: Promise.resolve(),
    getDuration: () => 30,
    getPosition: (callback: (seconds: number) => void) => callback(position),
    setPlaybackRate: jest.fn(),
    seek: jest.fn((seconds: number) => {
      position = seconds;
    }),
    play: jest.fn(() => new Promise<boolean>((resolve) => (finish = resolve))),
    pause: jest.fn(),
    stop: jest.fn(),
    dispose: jest.fn(),
  };

  return { engine, complete: () => finish?.(true) };
};

beforeEach(() => {
  mockFocused = true;
});

test('seeks once on accessibility adjustment and pauses when the screen loses focus', async () => {
  const { engine } = testEngine();
  jest.mocked(createAudioPlayer).mockReturnValue(engine);
  const result = await render(<AudioPlayer tracks={tracks} />);
  const slider = screen.getByRole('adjustable', { name: 'Playback position' });

  await fireEvent(slider, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
  await userEvent.press(screen.getByRole('button', { name: 'Play audio' }));

  expect(engine.seek).toHaveBeenCalledTimes(1);
  expect(engine.seek).toHaveBeenCalledWith(1);
  expect(engine.play).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button', { name: 'Pause audio' })).toBeEnabled();

  mockFocused = false;
  await result.rerender(<AudioPlayer tracks={tracks} />);

  expect(engine.pause).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button', { name: 'Play audio' })).toBeDisabled();
  expect(screen.getByText('0:01')).toBeVisible();
});

test('releases the finished track and plays the next track in the queue', async () => {
  const first = testEngine();
  const next = testEngine();
  jest.mocked(createAudioPlayer).mockReturnValueOnce(first.engine).mockReturnValueOnce(next.engine);
  const result = await render(<AudioPlayer tracks={tracks} />);

  await userEvent.press(screen.getByRole('button', { name: 'Play audio' }));
  await act(() => first.complete());

  expect(first.engine.dispose).toHaveBeenCalledTimes(1);
  expect(next.engine.play).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('header', { name: 'Amber Tide' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Next track' })).toBeDisabled();

  await result.unmount();

  expect(next.engine.dispose).toHaveBeenCalledTimes(1);
});

test('skips ten seconds and keeps the chosen speed on the next track without autoplay', async () => {
  const first = testEngine();
  const next = testEngine();
  jest.mocked(createAudioPlayer).mockReturnValueOnce(first.engine).mockReturnValueOnce(next.engine);
  await render(<AudioPlayer tracks={tracks} />);

  expect(screen.getByRole('button', { name: 'Back 10 seconds' })).toBeDisabled();

  await userEvent.press(screen.getByRole('button', { name: 'Forward 10 seconds' }));
  await userEvent.press(screen.getByRole('button', { name: 'Forward 10 seconds' }));
  await userEvent.press(screen.getByRole('button', { name: 'Back 10 seconds' }));

  expect(first.engine.seek.mock.calls).toEqual([[10], [20], [10]]);

  await userEvent.press(screen.getByRole('combobox', { name: 'Playback speed' }));
  await userEvent.press(screen.getByRole('radio', { name: '1.75×' }));
  await userEvent.press(screen.getByRole('button', { name: 'Next track' }));

  expect(first.engine.setPlaybackRate).toHaveBeenLastCalledWith(1.75);
  expect(next.engine.setPlaybackRate).toHaveBeenLastCalledWith(1.75);
  expect(first.engine.play).not.toHaveBeenCalled();
  expect(next.engine.play).not.toHaveBeenCalled();
});
