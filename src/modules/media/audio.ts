import Sound from 'react-native-sound';

export function createAudioPlayer(file: string, basePath = Sound.MAIN_BUNDLE) {
  let disposed = false;
  let sound: Sound;
  const ready = new Promise<void>((resolve, reject) => {
    sound = new Sound(file, basePath, (error) => {
      if (disposed) sound?.release();
      if (error) reject(error);
      else resolve();
    });
  });

  void ready.catch(() => undefined);
  return {
    ready,
    async play() {
      await ready;
      if (disposed) throw new Error('Audio player disposed');
      return new Promise<boolean>((resolve) => sound.play(resolve));
    },
    pause: () => sound?.pause(),
    stop: () => sound?.stop(),
    dispose() {
      disposed = true;
      sound?.release();
    },
  };
}
