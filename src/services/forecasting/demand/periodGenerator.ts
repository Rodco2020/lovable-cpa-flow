
import { addMonths, startOfMonth, format } from 'date-fns';
import { debugLog } from '../logger';
import { DataValidator } from './dataValidator';

/**
 * Period Generator Service with enhanced validation and safeguards
 */
export class PeriodGenerator {
  private static readonly MAX_PERIODS = 24; // Maximum 2 years to prevent performance issues

  /**
   * Generate monthly periods with validation and bounds checking
   */
  static generateMonthlyPeriods(startDate: Date, endDate: Date): Array<{ start: Date; end: Date }> {
    debugLog('Generating monthly periods', { startDate, endDate });

    try {
      // Validate inputs
      if (!startDate || !endDate) {
        console.warn('Invalid dates provided to generateMonthlyPeriods');
        return [];
      }

      if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
        console.warn('Non-Date objects provided to generateMonthlyPeriods');
        return [];
      }

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.warn('Invalid Date objects provided to generateMonthlyPeriods');
        return [];
      }

      if (endDate <= startDate) {
        console.warn('End date must be after start date');
        return [];
      }

      const periods: Array<{ start: Date; end: Date }> = [];
      let currentDate = startOfMonth(startDate);
      let iterationCount = 0;

      // Fixed: Use <= comparison to be inclusive of the end month
      while (currentDate <= endDate && iterationCount < this.MAX_PERIODS) {
        const monthStart = new Date(currentDate);
        const nextMonth = addMonths(currentDate, 1);
        const monthEnd = new Date(nextMonth.getTime() - 1); // End of current month

        // Validate generated dates
        if (isNaN(monthStart.getTime()) || isNaN(monthEnd.getTime())) {
          console.warn(`Invalid dates generated at iteration ${iterationCount}`);
          break;
        }

        periods.push({
          start: monthStart,
          end: monthEnd
        });

        currentDate = nextMonth;
        iterationCount++;

        // Additional safety check
        if (iterationCount > 0 && currentDate <= periods[iterationCount - 1].start) {
          console.warn('Date progression stalled in period generation');
          break;
        }
      }

      if (iterationCount >= this.MAX_PERIODS) {
        console.warn(`Period generation stopped at maximum limit: ${this.MAX_PERIODS} periods`);
      }

      debugLog(`Generated ${periods.length} monthly periods`);
      return periods;

    } catch (error) {
      console.error('Error generating monthly periods:', error);
      return [];
    }
  }

  /**
   * Generate period keys for caching and identification
   */
  static generatePeriodKeys(periods: Array<{ start: Date; end: Date }>): string[] {
    try {
      if (!Array.isArray(periods)) {
        return [];
      }

      const keys = periods
        .filter(period => 
          period && 
          period.start instanceof Date && 
          period.end instanceof Date &&
          !isNaN(period.start.getTime()) &&
          !isNaN(period.end.getTime())
        )
        .map(period => {
          try {
            return format(period.start, 'yyyy-MM');
          } catch (formatError) {
            console.warn('Error formatting period key:', formatError);
            return null;
          }
        })
        .filter((key): key is string => key !== null)
        .slice(0, this.MAX_PERIODS); // Additional safety limit

      return keys;
    } catch (error) {
      console.error('Error generating period keys:', error);
      return [];
    }
  }

  /**
   * Validate period overlap and consistency
   */
  static validatePeriods(periods: Array<{ start: Date; end: Date }>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      if (!Array.isArray(periods)) {
        errors.push('Periods must be an array');
        return { isValid: false, errors };
      }

      if (periods.length === 0) {
        errors.push('Periods array is empty');
        return { isValid: false, errors };
      }

      if (periods.length > this.MAX_PERIODS) {
        errors.push(`Too many periods: ${periods.length} (max: ${this.MAX_PERIODS})`);
      }

      for (let i = 0; i < periods.length; i++) {
        const period = periods[i];
        
        // Validate period structure
        if (!period || !period.start || !period.end) {
          errors.push(`Period ${i} is missing start or end date`);
          continue;
        }

        if (!(period.start instanceof Date) || !(period.end instanceof Date)) {
          errors.push(`Period ${i} contains non-Date objects`);
          continue;
        }

        if (isNaN(period.start.getTime()) || isNaN(period.end.getTime())) {
          errors.push(`Period ${i} contains invalid dates`);
          continue;
        }

        if (period.end <= period.start) {
          errors.push(`Period ${i} end date is not after start date`);
        }

        // Check for overlap with next period
        if (i < periods.length - 1) {
          const nextPeriod = periods[i + 1];
          if (nextPeriod && nextPeriod.start && period.end > nextPeriod.start) {
            errors.push(`Period ${i} overlaps with period ${i + 1}`);
          }
        }
      }

      return {
        isValid: errors.length === 0,
        errors
      };

    } catch (error) {
      console.error('Error validating periods:', error);
      return {
        isValid: false,
        errors: ['Validation process failed']
      };
    }
  }
}
