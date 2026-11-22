import { useRef, useState, type ComponentRef, type PropsWithChildren } from 'react';
import { ScrollView, View } from 'react-native';
import { format } from 'date-fns';
import { AppText } from '@/shared/ui/AppText';
import { Button } from '@/shared/ui/Button';
import { Screen } from '@/shared/ui/Screen';
import { useTheme } from '@/shared/theme/theme';
import { CarouselShowcase } from '@/modules/ui/CarouselShowcase';
import { CalendarInput, DateInput } from '@/modules/ui/DateInputs';
import { ControlledOtp, OtpEntry, PinInput } from '@/modules/ui/Otp';
import { AppPager } from '@/modules/ui/Paging';
import { Sheet, SheetTextField } from '@/modules/ui/Sheet';
import { StartTour, TourProvider, TourStep } from '@/modules/ui/Tour';

const pages = ['First page', 'Second page'];

const ShowcaseGroup = ({ title, children }: PropsWithChildren<{ title: string }>) => {
  const { colors, radii, spacing } = useTheme();

  return (
    <View
      style={{
        gap: spacing.md,
        padding: spacing.md,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
      }}
    >
      <AppText variant="heading">{title}</AppText>
      {children}
    </View>
  );
};

const PageContent = ({ label }: { label: string }) => {
  const { colors, radii, spacing } = useTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        height: 128,
        padding: spacing.md,
        borderRadius: radii.md,
        backgroundColor: colors.primaryMuted,
      }}
    >
      <AppText>{label}</AppText>
    </View>
  );
};

const UiShowcaseContent = () => {
  const { spacing } = useTheme();
  const scrollView = useRef<ComponentRef<typeof ScrollView>>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [date, setDate] = useState(() => new Date());
  const [day, setDay] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [otpFilled, setOtpFilled] = useState(false);
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [page, setPage] = useState(0);

  return (
    <Screen>
      <ScrollView
        ref={scrollView}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
      >
        <ShowcaseGroup title="Bottom sheet">
          <Button label="Open bottom sheet" onPress={() => setSheetOpen(true)} />
        </ShowcaseGroup>
        <ShowcaseGroup title="Calendar and date picker">
          <CalendarInput value={day} onChange={setDay} />
          <AppText>Selected day {day}</AppText>
          <Button label={format(date, 'PP')} onPress={() => setDateOpen(true)} />
        </ShowcaseGroup>
        <ShowcaseGroup title="OTP and PIN input">
          <AppText>One-time code</AppText>
          <OtpEntry autoFocus={false} onComplete={() => setOtpFilled(true)} blurOnFilled />
          {otpFilled ? <AppText accessibilityLiveRegion="polite">Code entered</AppText> : null}
          <AppText>Controlled verification code</AppText>
          <ControlledOtp value={code} onChange={setCode} />
          <AppText>Four-digit PIN</AppText>
          <PinInput value={pin} onChange={setPin} length={4} />
        </ShowcaseGroup>
        <ShowcaseGroup title="Carousel">
          <CarouselShowcase />
        </ShowcaseGroup>
        <ShowcaseGroup title="Pager view">
          <View style={{ height: 128 }}>
            <AppPager
              pages={pages.map((label) => ({ id: label, content: <PageContent label={label} /> }))}
              onPage={setPage}
            />
          </View>
          <AppText tone="muted">
            Page {page + 1} of {pages.length}
          </AppText>
        </ShowcaseGroup>
        <ShowcaseGroup title="Copilot tour">
          <TourStep
            name="overview"
            order={1}
            description="This is the first tour target."
            label="Overview"
          />
          <TourStep
            name="details"
            order={2}
            description="The tour can highlight another control next."
            label="Details"
          />
          <StartTour scrollViewRef={scrollView} />
        </ShowcaseGroup>
      </ScrollView>
      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <AppText variant="heading">Bottom sheet</AppText>
        <SheetTextField accessibilityLabel="Sheet notes" placeholder="Add a note" />
        <Button label="Close sheet" onPress={() => setSheetOpen(false)} variant="secondary" />
      </Sheet>
      <DateInput
        open={dateOpen}
        value={date}
        onChange={setDate}
        onClose={() => setDateOpen(false)}
      />
    </Screen>
  );
};

export const UiShowcaseScreen = () => (
  <TourProvider>
    <UiShowcaseContent />
  </TourProvider>
);
