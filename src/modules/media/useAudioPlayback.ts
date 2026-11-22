import { useEffect, useEffectEvent, useRef, useState } from 'react';

import { createAudioPlayer } from '@/modules/media/audio';

type Playback = {
  status: 'loading' | 'ready' | 'playing' | 'paused' | 'failed';
  duration: number;
  position: number;
};

type Options = {
  file: string;
  basePath?: string;
  canPlay: boolean;
  startPlaying: boolean;
  playbackRate: number;
  onEnd: () => void;
  onError?: (error: unknown) => void;
};

type Engine = ReturnType<typeof createAudioPlayer>;

const initialPlayback: Playback = { status: 'loading', duration: 0, position: 0 };

export const useAudioPlayback = ({
  file,
  basePath,
  canPlay,
  startPlaying,
  playbackRate,
  onEnd,
  onError,
}: Options) => {
  const [playback, setPlayback] = useState(initialPlayback);
  const [attempt, setAttempt] = useState(0);
  const engine = useRef<Engine | null>(null);
  const playing = useRef(false);
  const playbackRequest = useRef(0);
  const positionRequest = useRef(0);

  const fail = (error: unknown) => {
    engine.current?.dispose();
    engine.current = null;
    playing.current = false;
    setPlayback({ ...initialPlayback, status: 'failed' });
    onError?.(error);
  };

  const play = async () => {
    const audio = engine.current;
    if (!canPlay || !audio || playing.current) return;

    const request = ++playbackRequest.current;
    playing.current = true;
    setPlayback((current) => ({ ...current, status: 'playing' }));

    try {
      const finished = await audio.play();
      if (playbackRequest.current !== request) return;
      if (!finished) throw new Error('Audio playback failed');

      playing.current = false;
      positionRequest.current += 1;
      audio.seek(0);
      setPlayback((current) => ({ ...current, status: 'ready', position: 0 }));
      onEnd();
    } catch (error) {
      if (playbackRequest.current === request) fail(error);
    }
  };

  const pause = () => {
    if (!playing.current) return;

    playing.current = false;
    playbackRequest.current += 1;
    const request = ++positionRequest.current;
    const audio = engine.current;

    audio?.pause();
    setPlayback((current) => ({ ...current, status: 'paused' }));
    audio?.getPosition((position) => {
      if (position !== null && positionRequest.current === request) {
        setPlayback((current) => ({ ...current, position: Math.min(position, current.duration) }));
      }
    });
  };

  const onPrepared = useEffectEvent((audio: Engine, shouldPlay: boolean) => {
    audio.setPlaybackRate(playbackRate);
    setPlayback({ status: 'ready', duration: audio.getDuration(), position: 0 });
    if (shouldPlay || startPlaying) void play();
  });
  const onPreparationError = useEffectEvent(fail);
  const onInactive = useEffectEvent(pause);

  useEffect(() => {
    let active = true;

    void Promise.resolve()
      .then(() => {
        if (!active) return;

        const audio = createAudioPlayer(file, basePath);
        engine.current = audio;

        return audio.ready.then(() => {
          if (active) onPrepared(audio, attempt > 0);
        });
      })
      .catch((error: unknown) => {
        if (active) onPreparationError(error);
      });

    return () => {
      active = false;
      playbackRequest.current += 1;
      positionRequest.current += 1;
      playing.current = false;
      engine.current?.dispose();
      engine.current = null;
    };
  }, [attempt, basePath, file]);

  useEffect(() => {
    if (!canPlay) onInactive();
  }, [canPlay]);

  useEffect(() => {
    engine.current?.setPlaybackRate(playbackRate);
  }, [playbackRate]);

  useEffect(() => {
    if (playback.status !== 'playing' || !canPlay) return;

    let active = true;
    let reading = false;
    const timer = setInterval(() => {
      const audio = engine.current;
      if (!audio || reading) return;

      reading = true;
      const request = positionRequest.current;
      audio.getPosition((position) => {
        reading = false;
        if (position !== null && active && positionRequest.current === request) {
          setPlayback((current) => ({
            ...current,
            position: Math.min(position, current.duration),
          }));
        }
      });
    }, 250);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [canPlay, playback.status]);

  const seek = (seconds: number) => {
    if (!canPlay || playback.duration <= 0 || !Number.isFinite(seconds)) return;

    const position = Math.max(0, Math.min(seconds, playback.duration));
    positionRequest.current += 1;
    engine.current?.seek(position);
    setPlayback((current) => ({ ...current, position }));
  };

  const retry = () => {
    setPlayback(initialPlayback);
    setAttempt((current) => current + 1);
  };

  return { ...playback, play, pause, seek, retry };
};
