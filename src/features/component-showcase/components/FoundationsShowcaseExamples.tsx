import { useState, type PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/shared/theme/theme';
import { ThemedText } from '@/shared/ui/AppText';
import { ThemedView } from '@/shared/ui/ThemedView';
import { Avatar } from '@/shared/ui/Avatar';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Chip } from '@/shared/ui/Chip';
import { Divider } from '@/shared/ui/Divider';
import { Expandable } from '@/shared/ui/Expandable';
import { Loading, ProgressBar, Skeleton } from '@/shared/ui/Feedback';
import { FloatingButton } from '@/shared/ui/FloatingButton';
import { Grid } from '@/shared/ui/Grid';
import { Footer, Header } from '@/shared/ui/ScreenRegions';
import { Checkbox, RadioGroup } from '@/shared/ui/SelectionControl';
import { Slider } from '@/shared/ui/Slider';
import { Steps } from '@/shared/ui/Steps';
import { Toggle } from '@/shared/ui/Toggle';

const densities = [
  { label: 'Compact', value: 'compact' },
  { label: 'Comfortable', value: 'comfortable' },
];

const checkoutSteps = [
  { id: 'details', label: 'Details' },
  { id: 'review', label: 'Review' },
  { id: 'confirmation', label: 'Confirmation' },
];

const DemoGroup = ({ title, children }: PropsWithChildren<{ title: string }>) => (
  <Card>
    <ThemedText variant="heading">{title}</ThemedText>
    {children}
  </Card>
);

export const FoundationsShowcaseExamples = () => {
  const { spacing, radii } = useTheme();
  const [alerts, setAlerts] = useState(true);
  const [remember, setRemember] = useState(false);
  const [density, setDensity] = useState('comfortable');
  const [selected, setSelected] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [progress, setProgress] = useState(35);
  const [checkout, setCheckout] = useState(0);

  return (
    <View style={{ gap: spacing.md }}>
      <DemoGroup title="Text and surfaces">
        <ThemedView tone="muted" style={{ padding: spacing.md, borderRadius: radii.md }}>
          <ThemedText variant="body">Themed text on a themed view</ThemedText>
          <ThemedText variant="caption" tone="muted">
            Supporting text
          </ThemedText>
        </ThemedView>
        <Divider />
        <View style={[styles.inline, { gap: spacing.sm }]}>
          <Avatar name="Aisha Bell" />
          <Badge label="Draft" />
          <Badge label="Active" tone="primary" />
        </View>
      </DemoGroup>

      <DemoGroup title="Selection">
        <Toggle label="Notifications" value={alerts} onValueChange={setAlerts} />
        <Checkbox label="Remember selection" checked={remember} onCheckedChange={setRemember} />
        <Divider />
        <RadioGroup options={densities} value={density} onValueChange={setDensity} />
        <Chip label="Available only" selected={selected} onPress={() => setSelected(!selected)} />
      </DemoGroup>

      <DemoGroup title="Actions and expandable content">
        <Expandable title="Shipping options" expanded={expanded} onExpandedChange={setExpanded}>
          <ThemedText tone="muted">Standard shipping is available for this order.</ThemedText>
        </Expandable>
        <ThemedView
          tone="muted"
          style={[styles.floatingPreview, { padding: spacing.md, borderRadius: radii.md }]}
        >
          <ThemedText variant="caption">Items added: {quantity}</ThemedText>
          <FloatingButton label="Add item" onPress={() => setQuantity((current) => current + 1)} />
        </ThemedView>
        <Button label="Clear preview" variant="secondary" onPress={() => setQuantity(0)} />
      </DemoGroup>

      <DemoGroup title="Layout">
        <Header title="Order summary" subtitle="Header region" />
        <Grid>
          <Card>
            <ThemedText>Shipping</ThemedText>
          </Card>
          <Card>
            <ThemedText>Billing</ThemedText>
          </Card>
        </Grid>
        <Footer>
          <ThemedText tone="muted">Footer region</ThemedText>
        </Footer>
      </DemoGroup>

      <DemoGroup title="Progress and steps">
        <Slider label="Progress" value={progress} onValueChange={setProgress} step={5} />
        <ProgressBar label="Upload progress" value={progress / 100} />
        <Divider />
        <Steps items={checkoutSteps} current={checkout} />
        <Button
          label={checkout < checkoutSteps.length ? 'Next step' : 'Reset steps'}
          onPress={() =>
            setCheckout((current) => (current < checkoutSteps.length ? current + 1 : 0))
          }
        />
      </DemoGroup>

      <DemoGroup title="Loading states">
        <Loading label="Loading orders" showLabel />
        <Skeleton width="70%" />
        <Skeleton width="45%" />
        <Button label="Submitting" loading onPress={() => {}} />
      </DemoGroup>
    </View>
  );
};

const styles = StyleSheet.create({
  inline: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  floatingPreview: { minHeight: 112 },
});
