import { memo, useState, type ComponentProps } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';

import { useAudioPlayback } from '@/modules/media/useAudioPlayback';
import { useAppActive } from '@/shared/hooks/useAppActive';
import { useTheme } from '@/shared/theme/theme';
import { AppText } from '@/shared/ui/AppText';
import { Dropdown } from '@/shared/ui/Dropdown';
import { Icon } from '@/shared/ui/Icon';
import { Slider } from '@/shared/ui/Slider';

export type AudioTrack = {
  file: string;
  basePath?: string;
  title: string;
  artist?: string;
  artwork?: ImageSourcePropType;
};

export type AudioPlayerProps = {
  onError?: (error: unknown) => void;
} & ({ tracks: readonly AudioTrack[] } | { file: string; basePath?: string; label?: string });

type TrackSelection = { index: number; startPlaying: boolean };

const playbackRates = ['0.5', '0.75', '1', '1.25', '1.5', '1.75', '2'] as const;
type PlaybackRate = (typeof playbackRates)[number];
const playbackRateOptions = playbackRates.map((value) => ({ value, label: value + '×' }));
const jumpSeconds = 10;

const formatTime = (seconds: number) => {
  const total = Math.floor(Math.max(0, seconds));
  const minutes = Math.floor(total / 60);

  return `${minutes}:${String(total % 60).padStart(2, '0')}`;
};

const AudioArtwork = ({
  source,
  style,
  thumbnail = false,
}: {
  source?: ImageSourcePropType;
  style: StyleProp<ViewStyle>;
  thumbnail?: boolean;
}) => {
  const { colors, radii } = useTheme();

  return (
    <View
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.artwork,
        { backgroundColor: colors.primaryMuted, borderRadius: thumbnail ? radii.md : radii.lg },
        style,
      ]}
    >
      <Icon name="audio-lines" size={thumbnail ? 20 : 60} color={colors.primary} />
      {source ? <Image source={source} resizeMode="cover" style={styles.image} /> : null}
    </View>
  );
};

const AudioArtworkStage = memo(({ source }: { source?: ImageSourcePropType }) => {
  const { colors, radii, spacing } = useTheme();

  return (
    <View
      importantForAccessibility="no-hide-descendants"
      style={[styles.artworkStage, { backgroundColor: colors.surfaceMuted }]}
    >
      {source ? (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Image
            source={source}
            resizeMode="cover"
            blurRadius={24}
            fadeDuration={0}
            style={[styles.image, styles.ambientArtwork]}
          />
        </View>
      ) : null}
      <View style={[styles.coverSpace, { padding: spacing.lg }]}>
        <View
          style={[
            styles.cover,
            {
              backgroundColor: colors.primaryMuted,
              borderRadius: radii.lg,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <AudioArtwork source={source} style={StyleSheet.absoluteFill} />
        </View>
      </View>
    </View>
  );
});

const AudioAction = ({
  label,
  icon,
  onPress,
  active = false,
  disabled = false,
  loading = false,
  caption,
}: {
  label: string;
  icon: ComponentProps<typeof Icon>['name'];
  onPress: () => void;
  active?: boolean;
  disabled?: boolean;
  loading?: boolean;
  caption?: string;
}) => {
  const { colors } = useTheme();
  const foreground = active ? colors.primaryText : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, busy: loading }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.action,
        active && styles.primaryAction,
        {
          backgroundColor: active ? colors.primary : pressed ? colors.surfaceMuted : 'transparent',
          opacity: pressed || (disabled && !loading) ? 0.4 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={foreground} />
      ) : (
        <>
          <Icon name={icon} size={active ? 28 : caption ? 18 : 24} color={foreground} />
          {caption ? (
            <AppText variant="caption" tone="muted" style={styles.actionCaption}>
              {caption}
            </AppText>
          ) : null}
        </>
      )}
    </Pressable>
  );
};

const AudioTimeline = ({
  duration,
  position,
  disabled,
  onSeek,
}: {
  duration: number;
  position: number;
  disabled: boolean;
  onSeek: (value: number) => void;
}) => {
  const [scrubbedPosition, setScrubbedPosition] = useState<number>();
  const visiblePosition = disabled ? position : (scrubbedPosition ?? position);
  const elapsed = formatTime(visiblePosition);
  const total = formatTime(duration);

  return (
    <View>
      <Slider
        label="Playback position"
        accessibilityValueText={`${elapsed} of ${total}`}
        showLabels={false}
        compact
        value={visiblePosition}
        maximum={duration}
        step={1}
        disabled={disabled}
        onValueChange={setScrubbedPosition}
        onSlidingComplete={(value) => {
          setScrubbedPosition(undefined);
          onSeek(value);
        }}
        onSlidingCancel={() => setScrubbedPosition(undefined)}
      />
      <View style={styles.times}>
        <AppText variant="caption" tone="muted" style={styles.timestamp}>
          {elapsed}
        </AppText>
        <AppText variant="caption" tone="muted" style={styles.timestamp}>
          {total}
        </AppText>
      </View>
    </View>
  );
};

const AudioQueue = memo(
  ({
    tracks,
    index,
    playing,
    onSelect,
  }: {
    tracks: readonly AudioTrack[];
    index: number;
    playing: boolean;
    onSelect: (selection: TrackSelection) => void;
  }) => {
    const { colors, radii, spacing } = useTheme();

    if (tracks.length < 2) return null;

    return (
      <View
        style={[
          styles.queue,
          { borderTopColor: colors.border, gap: spacing.xs, padding: spacing.md },
        ]}
      >
        <AppText variant="heading" style={{ marginBottom: spacing.xs }}>
          Queue
        </AppText>
        {tracks.map((track, trackIndex) => {
          const current = trackIndex === index;

          return (
            <Pressable
              key={`${trackIndex}:${track.file}`}
              accessibilityRole="button"
              accessibilityLabel={track.title}
              accessibilityState={{ selected: current, disabled: current }}
              disabled={current}
              onPress={() => onSelect({ index: trackIndex, startPlaying: true })}
              style={({ pressed }) => [
                styles.queueTrack,
                {
                  backgroundColor: current
                    ? colors.primaryMuted
                    : pressed
                      ? colors.surfaceMuted
                      : colors.surface,
                  borderRadius: radii.md,
                  gap: spacing.sm,
                  padding: spacing.sm,
                },
              ]}
            >
              <AudioArtwork source={track.artwork} style={styles.thumbnail} thumbnail />
              <View style={styles.trackText}>
                <AppText tone={current ? 'primary' : 'normal'} numberOfLines={1}>
                  {track.title}
                </AppText>
                {track.artist ? (
                  <AppText variant="caption" tone="muted" numberOfLines={1}>
                    {track.artist}
                  </AppText>
                ) : null}
              </View>
              <Icon
                name={current ? (playing ? 'audio-lines' : 'disc-3') : 'play'}
                size={18}
                color={current ? colors.primary : colors.muted}
              />
            </Pressable>
          );
        })}
      </View>
    );
  },
);

const AudioTrackPlayer = ({
  track,
  tracks,
  selection,
  onSelect,
  playbackRate,
  onPlaybackRateChange,
  onError,
}: {
  track: AudioTrack;
  tracks: readonly AudioTrack[];
  selection: TrackSelection;
  onSelect: (selection: TrackSelection) => void;
  playbackRate: PlaybackRate;
  onPlaybackRateChange: (rate: PlaybackRate) => void;
  onError?: (error: unknown) => void;
}) => {
  const { colors, radii, spacing } = useTheme();
  const focused = useIsFocused();
  const active = useAppActive();
  const canPlay = focused && active;
  const { index, startPlaying } = selection;
  const hasNext = index + 1 < tracks.length;
  const player = useAudioPlayback({
    file: track.file,
    basePath: track.basePath,
    canPlay,
    startPlaying,
    playbackRate: Number(playbackRate),
    onError,
    onEnd: () => {
      if (hasNext && canPlay) onSelect({ index: index + 1, startPlaying: true });
    },
  });
  const playing = player.status === 'playing';
  const loading = player.status === 'loading';
  const failed = player.status === 'failed';
  const canSeek = canPlay && player.duration > 0;
  const selectNeighbor = (offset: number) =>
    onSelect({ index: index + offset, startPlaying: playing });
  const playAction = playing ? player.pause : failed ? player.retry : () => void player.play();

  return (
    <View
      style={[
        styles.player,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radii.lg + spacing.sm,
        },
      ]}
    >
      <AudioArtworkStage source={track.artwork} />
      <View style={{ padding: spacing.md, gap: spacing.sm }}>
        <View style={[styles.metadata, { gap: spacing.sm }]}>
          <View accessibilityLiveRegion="polite" style={styles.trackText}>
            <AppText variant="title" numberOfLines={2} style={styles.trackTitle}>
              {track.title}
            </AppText>
            {track.artist ? (
              <AppText variant="caption" tone="muted" numberOfLines={2}>
                {track.artist}
              </AppText>
            ) : null}
          </View>
          <Dropdown
            label="Playback speed"
            showLabel={false}
            compact
            value={playbackRate}
            options={playbackRateOptions}
            onChange={onPlaybackRateChange}
            disabled={!canPlay || loading || failed}
          />
        </View>
        <AudioTimeline
          duration={player.duration}
          position={player.position}
          disabled={!canPlay || loading || failed}
          onSeek={player.seek}
        />
        <View style={styles.transport}>
          {tracks.length > 1 ? (
            <AudioAction
              icon="skip-back"
              label="Previous track"
              disabled={!canPlay || index === 0}
              onPress={() => selectNeighbor(-1)}
            />
          ) : null}
          <AudioAction
            icon="rewind"
            caption="10s"
            label="Back 10 seconds"
            disabled={!canSeek || player.position <= 0}
            onPress={() => player.seek(player.position - jumpSeconds)}
          />
          <AudioAction
            active
            icon={playing ? 'pause' : failed ? 'rotate-ccw' : 'play'}
            label={
              loading
                ? 'Loading audio'
                : playing
                  ? 'Pause audio'
                  : failed
                    ? 'Retry audio'
                    : 'Play audio'
            }
            loading={loading}
            disabled={loading || !canPlay}
            onPress={playAction}
          />
          <AudioAction
            icon="fast-forward"
            caption="10s"
            label="Forward 10 seconds"
            disabled={!canSeek || player.position >= player.duration}
            onPress={() => player.seek(player.position + jumpSeconds)}
          />
          {tracks.length > 1 ? (
            <AudioAction
              icon="skip-forward"
              label="Next track"
              disabled={!canPlay || !hasNext}
              onPress={() => selectNeighbor(1)}
            />
          ) : null}
        </View>
        {failed ? (
          <AppText tone="danger" accessibilityLiveRegion="polite">
            Audio could not be played.
          </AppText>
        ) : null}
      </View>
      <AudioQueue tracks={tracks} index={index} playing={playing} onSelect={onSelect} />
    </View>
  );
};

export const AudioPlayer = (props: AudioPlayerProps) => {
  const [selection, setSelection] = useState<TrackSelection>({ index: 0, startPlaying: false });
  const [playbackRate, setPlaybackRate] = useState<PlaybackRate>('1');
  const tracks =
    'tracks' in props
      ? props.tracks
      : [{ file: props.file, basePath: props.basePath, title: props.label ?? 'Audio' }];
  const index = Math.min(selection.index, tracks.length - 1);
  const track = tracks[index];

  if (!track) return <AppText tone="muted">No audio tracks available.</AppText>;

  return (
    <AudioTrackPlayer
      key={JSON.stringify([index, track.file, track.basePath])}
      track={track}
      tracks={tracks}
      selection={{ ...selection, index }}
      onSelect={setSelection}
      playbackRate={playbackRate}
      onPlaybackRateChange={setPlaybackRate}
      onError={props.onError}
    />
  );
};

const styles = StyleSheet.create({
  player: { borderWidth: 1, alignSelf: 'center', width: '100%', maxWidth: 480, overflow: 'hidden' },
  artwork: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  artworkStage: { overflow: 'hidden' },
  coverSpace: { alignItems: 'center' },
  ambientArtwork: { opacity: 0.56, transform: [{ scale: 1.12 }] },
  cover: {
    width: '100%',
    maxWidth: 280,
    maxHeight: 280,
    aspectRatio: 1,
    elevation: 8,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 14,
  },
  thumbnail: { width: 42, height: 42 },
  image: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  metadata: { flexDirection: 'row', alignItems: 'center' },
  trackTitle: { letterSpacing: -0.55 },
  times: { flexDirection: 'row', justifyContent: 'space-between' },
  timestamp: { fontVariant: ['tabular-nums'], fontSize: 12, lineHeight: 16 },
  transport: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  action: {
    flexGrow: 1,
    flexBasis: 44,
    maxWidth: 56,
    minWidth: 44,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryAction: {
    flexGrow: 0,
    flexBasis: 64,
    minWidth: 64,
    maxWidth: 64,
    height: 64,
    borderRadius: 32,
  },
  actionCaption: { fontSize: 11, lineHeight: 14, fontWeight: '600' },
  queue: { borderTopWidth: StyleSheet.hairlineWidth },
  queueTrack: { flexDirection: 'row', alignItems: 'center', minHeight: 56 },
  trackText: { flex: 1 },
});
