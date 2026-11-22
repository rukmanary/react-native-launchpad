import { createAudioPlayer } from '@/modules/media/audio';

const mockPrepare = jest.fn<void, [(error?: string) => void]>();
const mockPlay = jest.fn<void, [(completed: boolean) => void]>();
const mockPause = jest.fn();
const mockStop = jest.fn();
const mockRelease = jest.fn();
const mockPosition = jest.fn<void, [(position: number, playing?: boolean) => void]>();
const mockSeek = jest.fn();
const mockSpeed = jest.fn();

jest.mock('react-native-sound', () => {
  const Sound = (_file: string, _basePath: string, callback: (error?: string) => void) => {
    mockPrepare(callback);

    return {
      play: mockPlay,
      pause: mockPause,
      stop: mockStop,
      release: mockRelease,
      getDuration: () => 30,
      getCurrentTime: mockPosition,
      setCurrentTime: mockSeek,
      setSpeed: mockSpeed,
    };
  };

  return Object.assign(jest.fn(Sound), { MAIN_BUNDLE: '/bundle' });
});

const prepared = () => {
  mockPrepare.mock.calls[0]![0]();
};

describe('createAudioPlayer', () => {
  it('applies the selected speed only to active playback and ignores stale rate changes', async () => {
    const player = createAudioPlayer('test.m4a');
    prepared();
    await player.ready;

    player.setPlaybackRate(1.5);
    expect(mockSpeed).not.toHaveBeenCalled();
    expect(mockPosition).not.toHaveBeenCalled();

    const first = player.play();
    await Promise.resolve();
    mockPosition.mock.calls[0]![0](0, true);
    expect(mockSpeed).toHaveBeenLastCalledWith(1.5);

    player.setPlaybackRate(2);
    player.pause();
    mockPosition.mock.calls[1]![0](8, true);
    expect(mockSpeed).toHaveBeenCalledTimes(1);
    await expect(first).resolves.toBe(false);

    const second = player.play();
    await Promise.resolve();
    mockPosition.mock.calls[2]![0](8, true);
    expect(mockSpeed).toHaveBeenLastCalledWith(2);

    player.setPlaybackRate(1);
    mockPosition.mock.calls[3]![0](12, true);
    expect(mockSpeed).toHaveBeenLastCalledWith(1);
    mockPlay.mock.calls[1]![0](true);
    await expect(second).resolves.toBe(true);
  });

  it('bounds seeks to the duration and ignores position callbacks after disposal', async () => {
    const player = createAudioPlayer('test.m4a');
    const onPosition = jest.fn();

    player.seek(10);
    expect(player.getDuration()).toBe(0);
    expect(mockSeek).not.toHaveBeenCalled();

    prepared();
    await player.ready;
    player.seek(-5);
    player.seek(60);
    player.seek(Number.NaN);
    player.getPosition(onPosition);
    mockPosition.mock.calls[0]![0](12);
    player.getPosition(onPosition);
    player.dispose();
    mockPosition.mock.calls[1]![0](14);

    expect(mockSeek.mock.calls).toEqual([[0], [30]]);
    expect(onPosition.mock.calls).toEqual([[12]]);
  });

  it('releases a sound once when disposal happens during preparation', async () => {
    const player = createAudioPlayer('test.wav');

    player.dispose();
    expect(mockRelease).not.toHaveBeenCalled();
    prepared();
    await player.ready;
    player.dispose();

    expect(mockRelease).toHaveBeenCalledTimes(1);
    await expect(player.play()).rejects.toThrow('Audio player disposed');
    expect(mockPlay).not.toHaveBeenCalled();
  });

  it('ignores stale native completions after a pause', async () => {
    const player = createAudioPlayer('test.wav');
    prepared();

    const first = player.play();
    await Promise.resolve();
    player.pause();
    const second = player.play();
    await Promise.resolve();
    mockPlay.mock.calls[0]![0](false);
    mockPlay.mock.calls[1]![0](true);

    expect(mockPause).toHaveBeenCalledTimes(1);
    await expect(first).resolves.toBe(false);
    await expect(second).resolves.toBe(true);
  });

  it('cancels playback queued before preparation when stopped', async () => {
    const player = createAudioPlayer('test.wav');

    const pending = player.play();
    player.stop();
    prepared();

    await expect(pending).resolves.toBe(false);
    expect(mockStop).toHaveBeenCalledTimes(1);
    expect(mockPlay).not.toHaveBeenCalled();
  });
});
