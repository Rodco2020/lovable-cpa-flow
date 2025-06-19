
import { format, parse } from 'date-fns';

/**
 * Service for processing time periods in matrix transformation
 */
export class PeriodProcessingService {
  /**
   * Generate months array from forecast data
   */
  static generateMonthsFromForecast(forecastData: any[]): Array<{ key: string; label: string }> {
    return forecastData.map(period => ({
      key: period.period,
      label: period.periodLabel || format(parse(period.period, 'yyyy-MM', new Date()), 'MMM yyyy')
    }));
  }
}
