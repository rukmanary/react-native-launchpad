import { Image } from 'react-native';

import amberTide from '@/assets/showcase/media/amber-tide.m4a';
import amberTideCover from '@/assets/showcase/media/amber-tide.jpg';
import stillwater from '@/assets/showcase/media/stillwater.m4a';
import stillwaterCover from '@/assets/showcase/media/stillwater.jpg';
import { AudioPlayer, type AudioTrack } from '@/modules/media/AudioPlayer';

const demoTracks = [
  { audio: stillwater, artwork: stillwaterCover, title: 'Stillwater' },
  { audio: amberTide, artwork: amberTideCover, title: 'Amber Tide' },
];

const tracks: AudioTrack[] = demoTracks.flatMap(({ audio, artwork, title }) => {
  const file = Image.resolveAssetSource(audio)?.uri;

  return file ? [{ file, basePath: '', title, artist: 'Starter Pack Sessions', artwork }] : [];
});

export const AudioShowcase = () => <AudioPlayer tracks={tracks} />;
