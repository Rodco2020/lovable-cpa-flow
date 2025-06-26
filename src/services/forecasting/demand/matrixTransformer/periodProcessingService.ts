
import { format, addMonths, startOfMonth } from 'date-fns';
import { ForecastData } from '@/types/forecasting';

/**
 * Service responsible for processing forecast periods
 * FIXED: Ensures proper 12-month data generation
 */
export class PeriodProcessingService {
  /**
   * FIXED: Generate months array from forecast data ensuring 12 months minimum
   */
  static generateMonthsFromForecast(forecastData: ForecastData[]): Array<{ key: string; label: string }> {
    try {
      console.log(`🔧 [PERIOD PROCESSING] FIXED: Processing ${forecastData.length} forecast periods`);

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
        .filter((month): month is { key: string; label: string } => month !== null);

      // CRITICAL FIX: Ensure we have at least 12 months of data
      if (months.length < 12) {
        console.warn(`⚠️ [PERIOD PROCESSING] Only ${months.length} months generated, ensuring 12 months`);
        return this.ensureTwelveMonths(months);
      }

      console.log(`✅ [PERIOD PROCESSING] FIXED: Generated ${months.length} months successfully`);
      return months.slice(0, 24); // Limit to prevent performance issues, but allow more than 12
    } catch (error) {
      console.error('Error generating months from forecast:', error);
      return this.generateFallbackTwelveMonths();
    }
  }

  /**
   * FIXED: Ensure we always have 12 months of data
   */
  private static ensureTwelveMonths(existingMonths: Array<{ key: string; label: string }>): Array<{ key: string; label: string }> {
    const startDate = existingMonths.length > 0 
      ? new Date(existingMonths[0].key + '-01')
      : startOfMonth(new Date());

    const months: Array<{ key: string; label: string }> = [];
    
    for (let i = 0; i < 12; i++) {
      const monthDate = addMonths(startDate, i);
      const key = format(monthDate, 'yyyy-MM');
      
      // Use existing month if available, otherwise generate new
      const existingMonth = existingMonths.find(m => m.key === key);
      if (existingMonth) {
        months.push(existingMonth);
      } else {
        months.push({
          key,
          label: format(monthDate, 'MMM yyyy')
        });
      }
    }

    console.log(`🔧 [PERIOD PROCESSING] FIXED: Ensured 12 months from ${existingMonths.length} existing months`);
    return months;
  }

  /**
   * FIXED: Generate fallback 12 months when all else fails
   */
  private static generateFallbackTwelveMonths(): Array<{ key: string; label: string }> {
    const startDate = startOfMonth(new Date());
    const months: Array<{ key: string; label: string }> = [];
    
    for (let i = 0; i < 12; i++) {
      const monthDate = addMonths(startDate, i);
      months.push({
        key: format(monthDate, 'yyyy-MM'),
        label: format(monthDate, 'MMM yyyy')
      });
    }

    console.log(`🔧 [PERIOD PROCESSING] FIXED: Generated fallback 12 months starting from ${format(startDate, 'MMM yyyy')}`);
    return months;
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
