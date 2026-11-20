import DatePicker from 'react-native-date-picker';
import { Calendar, type DateData } from 'react-native-calendars';

export function DateInput({
  open,
  value,
  onChange,
  onClose,
}: {
  open: boolean;
  value: Date;
  onChange: (date: Date) => void;
  onClose: () => void;
}) {
  return (
    <DatePicker
      modal
      open={open}
      date={value}
      mode="date"
      onConfirm={(date) => {
        onChange(date);
        onClose();
      }}
      onCancel={onClose}
    />
  );
}

export function CalendarInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (day: string) => void;
}) {
  return (
    <Calendar
      current={value}
      markedDates={{ [value]: { selected: true } }}
      onDayPress={(day: DateData) => onChange(day.dateString)}
    />
  );
}
