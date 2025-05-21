
import { eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, format } from 'date-fns';
import { DateRange, GranularityType } from '@/types/forecasting';

/**
 * Helper function to calculate period strings based on granularity
 * Exported to keep forecastingService lean
 */
export const calculatePeriods = (dateRange: DateRange, granularity: GranularityType): string[] => {
  const periods: string[] = [];

  switch (granularity) {
    case 'daily':
      eachDayOfInterval({
        start: dateRange.startDate,
        end: dateRange.endDate
      }).forEach(date => {
        periods.push(format(date, 'yyyy-MM-dd'));
      });
      break;

    case 'weekly':
      eachWeekOfInterval({
        start: dateRange.startDate,
        end: dateRange.endDate
      }, { weekStartsOn: 1 }).forEach(date => {
        periods.push(format(date, "yyyy-'W'ww"));
      });
      break;

    case 'monthly':
      eachMonthOfInterval({
        start: dateRange.startDate,
        end: dateRange.endDate
      }).forEach(date => {
        periods.push(format(date, 'yyyy-MM'));
      });
      break;
  }

  return periods;
};

/**
 * Helper function to convert a period string to a date range
 */
export const getPeriodDateRange = (period: string, granularity: GranularityType): DateRange => {
  let startDate: Date, endDate: Date;

  switch (granularity) {
    case 'daily':
      startDate = new Date(period + 'T00:00:00');
      endDate = new Date(period + 'T23:59:59');
      break;

    case 'weekly':
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

    case 'monthly':
      const [yearMonthly, month] = period.split('-').map(Number);
      startDate = new Date(yearMonthly, month - 1, 1);
      endDate = new Date(yearMonthly, month, 0, 23, 59, 59, 999);
      break;

    default:
      startDate = new Date();
      endDate = new Date();
      break;
  }

  return { startDate, endDate };
};
