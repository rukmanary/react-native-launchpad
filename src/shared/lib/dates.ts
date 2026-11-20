import { format, parseISO, isValid } from 'date-fns';
import { id, enUS } from 'date-fns/locale';

export function formatDate(value: string, language: 'id' | 'en' = 'id') {
  const date = parseISO(value);

  if (!isValid(date)) throw new Error('Invalid ISO date');
  return format(date, 'PPP', { locale: language === 'id' ? id : enUS });
}
