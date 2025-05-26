
import { RecurrencePattern } from '@/types/task';

export const formatRecurrencePattern = (pattern: RecurrencePattern): string => {
  switch (pattern.type) {
    case 'Daily':
      return `Daily${pattern.interval && pattern.interval > 1 ? ` (every ${pattern.interval} days)` : ''}`;
    case 'Weekly':
      if (pattern.weekdays && pattern.weekdays.length > 0) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weekdayNames = pattern.weekdays.map(day => days[day]);
        return `Weekly on ${weekdayNames.join(', ')}`;
      }
      return `Weekly${pattern.interval && pattern.interval > 1 ? ` (every ${pattern.interval} weeks)` : ''}`;
    case 'Monthly':
      return `Monthly on day ${pattern.dayOfMonth}${pattern.interval && pattern.interval > 1 ? ` (every ${pattern.interval} months)` : ''}`;
    case 'Quarterly':
      return `Quarterly${pattern.dayOfMonth ? ` on day ${pattern.dayOfMonth}` : ''}`;
    case 'Annually':
      return `Annually${pattern.monthOfYear ? ` in month ${pattern.monthOfYear}` : ''}${pattern.dayOfMonth ? `, day ${pattern.dayOfMonth}` : ''}`;
    case 'Custom':
      return `Custom (${pattern.customOffsetDays} days offset)`;
    default:
      return pattern.type;
  }
};

export const formatDate = (date: Date | null): string => {
  if (!date) return 'N/A';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
