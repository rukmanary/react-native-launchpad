import { useState, type ComponentRef, type PropsWithChildren, type RefObject } from 'react';
import { Text, View, type ScrollView } from 'react-native';
import {
  CopilotProvider,
  CopilotStep,
  useCopilot,
  walkthroughable,
  type TooltipProps,
} from 'react-native-copilot';

import { useTheme } from '@/shared/theme/theme';
import { AppText } from '@/shared/ui/AppText';
import { Button } from '@/shared/ui/Button';

const TourText = walkthroughable(Text);

const TourTooltip = ({ labels }: TooltipProps) => {
  const { currentStep, isFirstStep, isLastStep, goToNext, goToPrev, stop } = useCopilot();
  const { spacing } = useTheme();
  const [message, setMessage] = useState('');
  const run = (action: () => Promise<void>) => {
    setMessage('');
    void action().catch(() => setMessage('This step could not be opened. Try again.'));
  };

  return (
    <View style={{ gap: spacing.sm }}>
      <AppText accessibilityLiveRegion="polite">{currentStep?.text}</AppText>
      {message ? <AppText tone="danger">{message}</AppText> : null}
      {!isFirstStep ? (
        <Button
          label={labels.previous ?? 'Back'}
          variant="secondary"
          onPress={() => run(goToPrev)}
        />
      ) : null}
      {isLastStep ? (
        <Button label={labels.finish ?? 'Done'} onPress={() => run(stop)} />
      ) : (
        <>
          <Button label={labels.next ?? 'Next'} onPress={() => run(goToNext)} />
          <Button label={labels.skip ?? 'Skip'} variant="secondary" onPress={() => run(stop)} />
        </>
      )}
    </View>
  );
};

const TourStepNumber = () => {
  const { currentStepNumber } = useCopilot();
  const { colors, radii } = useTheme();

  return (
    <View
      style={{
        width: 30,
        height: 30,
        borderRadius: radii.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
      }}
    >
      <AppText variant="caption" style={{ color: colors.primaryText }}>
        {currentStepNumber}
      </AppText>
    </View>
  );
};

export const TourProvider = ({ children }: PropsWithChildren) => {
  const { colors, radii, spacing } = useTheme();

  return (
    <CopilotProvider
      animated
      androidStatusBarVisible
      overlay="svg"
      backdropColor={colors.overlay}
      tooltipStyle={{
        backgroundColor: colors.surface,
        borderRadius: radii.lg,
        padding: spacing.md,
      }}
      tooltipComponent={TourTooltip}
      stepNumberComponent={TourStepNumber}
      arrowColor={colors.surface}
      labels={{ previous: 'Back', next: 'Next', skip: 'Skip', finish: 'Done' }}
    >
      {children}
    </CopilotProvider>
  );
};

export const TourStep = ({
  name,
  order,
  description,
  label,
}: {
  name: string;
  order: number;
  description: string;
  label: string;
}) => {
  const { colors } = useTheme();

  return (
    <CopilotStep name={name} order={order} text={description}>
      <TourText style={{ color: colors.text, fontSize: 16 }}>{label}</TourText>
    </CopilotStep>
  );
};

export const StartTour = ({
  scrollViewRef,
}: {
  scrollViewRef?: RefObject<ComponentRef<typeof ScrollView> | null>;
}) => {
  const { start } = useCopilot();
  const [error, setError] = useState(false);
  const [starting, setStarting] = useState(false);

  const startTour = async () => {
    setError(false);
    setStarting(true);

    try {
      await start(undefined, scrollViewRef?.current);
    } catch {
      setError(true);
    } finally {
      setStarting(false);
    }
  };

  return (
    <>
      <Button label="Start tour" loading={starting} onPress={() => void startTour()} />
      {error ? (
        <AppText tone="danger" accessibilityLiveRegion="polite">
          The tour could not start. Try again.
        </AppText>
      ) : null}
    </>
  );
};
