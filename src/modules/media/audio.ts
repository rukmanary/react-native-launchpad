import Sound from 'react-native-sound';

export const createAudioPlayer = (file: string, basePath = Sound.MAIN_BUNDLE) => {
  let disposed = false;
  let loaded = false;
  let generation = 0;
  let playbackRate = 1;
  let appliedPlaybackRate = 1;
  let finishPlayback: ((completed: boolean) => void) | undefined;
  let sound: Sound;

  const release = () => {
    if (!loaded) return;

    loaded = false;
    sound.release();
  };

  const ready = new Promise<void>((resolve, reject) => {
    sound = new Sound(file, basePath, (error) => {
      if (error) {
        reject(new Error(typeof error === 'string' ? error : 'Could not prepare audio'));
        return;
      }

      loaded = true;
      if (disposed) release();
      resolve();
    });
  });

  // Callers may choose to await play() without observing ready directly.
  void ready.catch(() => undefined);

  const cancelPlayback = () => {
    generation += 1;
    finishPlayback?.(false);
    finishPlayback = undefined;
  };

  const applyPlaybackRate = (reapply = false) => {
    if (!finishPlayback || (!reapply && playbackRate === appliedPlaybackRate)) return;

    const request = generation;
    sound.getCurrentTime((_position, nativePlaying?: boolean) => {
      // On Android a speed change can start playback, so only send it to an active sound.
      if (generation !== request || !finishPlayback || nativePlaying === false) return;

      sound.setSpeed(playbackRate);
      appliedPlaybackRate = playbackRate;
    });
  };

  return {
    ready,
    setPlaybackRate: (rate: number) => {
      if (disposed || !Number.isFinite(rate) || rate < 0.5 || rate > 2) return;

      playbackRate = rate;
      applyPlaybackRate();
    },
    getDuration: () => {
      const duration = loaded && !disposed ? sound.getDuration() : 0;

      return Number.isFinite(duration) && duration > 0 ? duration : 0;
    },
    getPosition: (onPosition: (seconds: number | null) => void) => {
      if (!loaded || disposed) return;

      sound.getCurrentTime((seconds) => {
        if (!disposed) onPosition(Number.isFinite(seconds) && seconds >= 0 ? seconds : null);
      });
    },
    seek: (seconds: number) => {
      if (!loaded || disposed || !Number.isFinite(seconds)) return;

      const duration = sound.getDuration();
      const limit = Number.isFinite(duration) && duration >= 0 ? duration : Infinity;
      sound.setCurrentTime(Math.min(limit, Math.max(0, seconds)));
    },
    play: async () => {
      cancelPlayback();
      const request = generation;

      await ready;
      if (disposed) throw new Error('Audio player disposed');
      if (generation !== request) return false;

      return new Promise<boolean>((resolve) => {
        finishPlayback = resolve;
        sound.play((completed) => {
          if (generation !== request) return;

          finishPlayback = undefined;
          resolve(completed);
        });
        applyPlaybackRate(playbackRate !== 1);
      });
    },
    pause: () => {
      cancelPlayback();
      sound.pause();
    },
    stop: () => {
      cancelPlayback();
      sound.stop();
    },
    dispose: () => {
      if (disposed) return;

      disposed = true;
      cancelPlayback();
      release();
    },
  };
};
