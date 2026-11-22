import DatePicker from 'react-native-date-picker';
import { Calendar, type DateData } from 'react-native-calendars';
import { useTheme } from '@/shared/theme/theme';

export const DateInput = ({
  open,
  value,
  onChange,
  onClose,
  minDate,
  maxDate,
  locale,
}: {
  open: boolean;
  value: Date;
  onChange: (date: Date) => void;
  onClose: () => void;
  minDate?: Date;
  maxDate?: Date;
  locale?: string;
}) => {
  const { mode, colors } = useTheme();

  return (
    <DatePicker
      modal
      open={open}
      date={value}
      mode="date"
      locale={locale}
      minimumDate={minDate}
      maximumDate={maxDate}
      theme={mode}
      buttonColor={colors.primary}
      dividerColor={colors.border}
      onConfirm={(date) => {
        onChange(date);
        onClose();
      }}
      onCancel={onClose}
    />
  );
};

export const CalendarInput = ({
  value,
  onChange,
  minDate,
  maxDate,
}: {
  value: string;
  onChange: (day: string) => void;
  minDate?: string;
  maxDate?: string;
}) => {
  const { colors, mode } = useTheme();
  const calendarColors = {
    backgroundColor: colors.surface,
    calendarBackground: colors.surface,
    dayTextColor: colors.text,
    monthTextColor: colors.text,
    textSectionTitleColor: colors.muted,
    textDisabledColor: colors.disabled,
    todayTextColor: colors.primary,
    selectedDayBackgroundColor: colors.primary,
    selectedDayTextColor: colors.primaryText,
    arrowColor: colors.primary,
  };

  return (
    <Calendar
      key={mode + Object.values(calendarColors).join('|')}
      initialDate={value}
      minDate={minDate}
      maxDate={maxDate}
      enableSwipeMonths
      theme={calendarColors}
      markedDates={{ [value]: { selected: true } }}
      onDayPress={(day: DateData) => onChange(day.dateString)}
    />
  );
};
