
import { addMonths, startOfMonth, endOfMonth, format } from 'date-fns';

/**
 * Period Generator Service
 * Handles generation of time periods for forecasting
 */
export class PeriodGenerator {
  /**
   * Generate monthly periods for the forecast range
   */
  static generateMonthlyPeriods(startDate: Date, endDate: Date) {
    const periods = [];
    let currentDate = startOfMonth(startDate);
    
    while (currentDate <= endDate) {
      periods.push({
        start: currentDate,
        end: endOfMonth(currentDate),
        key: format(currentDate, 'yyyy-MM'),
        label: format(currentDate, 'MMM yyyy')
      });
      currentDate = addMonths(currentDate, 1);
    }
    
    return periods;
  }
}
