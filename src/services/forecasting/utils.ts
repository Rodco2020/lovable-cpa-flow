import { addDays } from 'date-fns';
import { DateRange, GranularityType } from '@/types/forecasting';

export const getPeriodDateRange = (
  period: string,
  granularity: GranularityType
): DateRange => {
  let startDate: Date;
  let endDate: Date;

  switch (granularity) {
    case 'daily':
      startDate = new Date(period + 'T00:00:00');
      endDate = new Date(period + 'T23:59:59');
      break;
    case 'weekly': {
      const [yearStrWeekly, weekStr] = period.split('-W');
      const yearWeekly = parseInt(yearStrWeekly);
      const week = parseInt(weekStr);
      startDate = new Date(yearWeekly, 0, 1);
      startDate.setDate(startDate.getDate() + (week - 1) * 7);
      while (startDate.getDay() !== 1) {
        startDate.setDate(startDate.getDate() - 1);
      }
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
    }
    case 'monthly': {
      const [yearMonthly, month] = period.split('-').map(Number);
      startDate = new Date(yearMonthly, month - 1, 1);
      endDate = new Date(yearMonthly, month, 0, 23, 59, 59, 999);
      break;
    }
    default:
      startDate = new Date();
      endDate = new Date();
      break;
  }

  return { startDate, endDate };
};
