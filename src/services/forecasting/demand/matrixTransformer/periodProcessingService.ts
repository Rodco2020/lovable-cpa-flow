
import { format } from 'date-fns';
import { ForecastData } from '@/types/forecasting';

/**
 * Service responsible for processing forecast periods
 */
export class PeriodProcessingService {
  /**
   * Generate months array from forecast data with validation
   */
  static generateMonthsFromForecast(forecastData: ForecastData[]): Array<{ key: string; label: string }> {
    try {
      const months = forecastData
        .map(period => {
          if (!period || !period.period) {
            return null;
          }
          
          try {
            // Validate period format (should be YYYY-MM)
            if (!/^\d{4}-\d{2}$/.test(period.period)) {
              console.warn(`Invalid period format: ${period.period}`);
              return null;
            }
            
            const date = new Date(period.period + '-01');
            if (isNaN(date.getTime())) {
              console.warn(`Invalid date from period: ${period.period}`);
              return null;
            }
            
            return {
              key: period.period,
              label: format(date, 'MMM yyyy')
            };
          } catch (error) {
            console.warn(`Error processing period ${period.period}:`, error);
            return null;
          }
        })
        .filter((month): month is { key: string; label: string } => month !== null)
        .slice(0, 24); // Limit to prevent performance issues

      return months;
    } catch (error) {
      console.error('Error generating months from forecast:', error);
      return [];
    }
  }

  /**
   * Format month key from date for consistent formatting
   */
  static formatMonthKey(date: Date): string {
    try {
      if (!date || isNaN(date.getTime())) {
        console.warn('Invalid date provided to formatMonthKey');
        return '';
      }
      
      return format(date, 'yyyy-MM');
    } catch (error) {
      console.warn('Error formatting month key:', error);
      return '';
    }
  }
}
