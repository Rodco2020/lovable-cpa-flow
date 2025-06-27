
import { ForecastData } from '@/types/forecasting';
import { debugLog } from '../../logger';

/**
 * Period Processing Service
 * Handles forecast period parsing and date range calculations
 */
export class PeriodProcessingService {
  /**
   * Generate month objects from forecast data
   */
  static generateMonthsFromForecast(forecastData: ForecastData[]): Array<{ key: string; label: string; startDate: Date; endDate: Date }> {
    return forecastData.map(period => {
      const { startDate, endDate } = this.getPeriodDateRange(period.period);
      
      return {
        key: period.period,
        label: this.formatPeriodLabel(period.period),
        startDate,
        endDate
      };
    });
  }

  /**
   * Get start and end dates for a forecast period
   */
  static getPeriodDateRange(period: string): { startDate: Date; endDate: Date } {
    try {
      // Parse period in format "YYYY-MM"
      const [year, month] = period.split('-').map(Number);
      
      if (!year || !month || month < 1 || month > 12) {
        throw new Error(`Invalid period format: ${period}`);
      }

      const startDate = new Date(year, month - 1, 1); // month is 0-indexed in Date constructor
      const endDate = new Date(year, month, 0); // Last day of the month

      debugLog(`Period ${period} date range:`, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      return { startDate, endDate };

    } catch (error) {
      console.error(`Error parsing period ${period}:`, error);
      
      // Fallback to current month
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      return { startDate, endDate };
    }
  }

  /**
   * Format period for display
   */
  static formatPeriodLabel(period: string): string {
    try {
      const [year, month] = period.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
    } catch (error) {
      console.warn(`Error formatting period label for ${period}:`, error);
      return period;
    }
  }

  /**
   * Validate if a period string is in the correct format
   */
  static isValidPeriod(period: string): boolean {
    const periodRegex = /^\d{4}-\d{2}$/;
    if (!periodRegex.test(period)) {
      return false;
    }

    const [year, month] = period.split('-').map(Number);
    return year >= 2000 && year <= 2100 && month >= 1 && month <= 12;
  }

  /**
   * Get the current period in YYYY-MM format
   */
  static getCurrentPeriod(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * Get a list of periods for a given number of months from a start period
   */
  static generatePeriodSequence(startPeriod: string, monthCount: number): string[] {
    const periods: string[] = [];
    const [startYear, startMonth] = startPeriod.split('-').map(Number);
    
    for (let i = 0; i < monthCount; i++) {
      const date = new Date(startYear, startMonth - 1 + i, 1);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      periods.push(`${year}-${month}`);
    }
    
    return periods;
  }
}
