import type { PropsWithChildren } from 'react';
import { Text } from 'react-native';
import { CopilotProvider, CopilotStep, useCopilot, walkthroughable } from 'react-native-copilot';
import { Button } from '../../shared/ui/Button';

const TourText = walkthroughable(Text);

export function TourProvider({ children }: PropsWithChildren) {
  return (
    <CopilotProvider animated overlay="svg" backdropColor="rgba(0,0,0,0.65)">
      {children}
    </CopilotProvider>
  );
}

export function TourStep({
  name,
  order,
  description,
  label,
}: {
  name: string;
  order: number;
  description: string;
  label: string;
}) {
  return (
    <CopilotStep name={name} order={order} text={description}>
      <TourText>{label}</TourText>
    </CopilotStep>
  );
}

export function StartTour() {
  const { start } = useCopilot();

  return (
    <Button
      label="Start tour"
      onPress={() => {
        void start();
      }}
    />
  );
}
