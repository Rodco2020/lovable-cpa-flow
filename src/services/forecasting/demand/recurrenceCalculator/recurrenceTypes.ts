
import { WeekdayUtils } from './weekdayUtils';

/**
 * Enhanced recurrence type calculation utilities with robust error handling
 */
export class RecurrenceTypeCalculator {
  /**
   * Calculate monthly occurrences for non-annual recurrence types
   * Enhanced with improved weekdays support and error handling
   */
  static calculateMonthlyOccurrences(
    recurrenceType: string,
    interval: number,
    periodMonth: number,
    startMonth = 0,
    weekdays?: number[]
  ): number {
    const type = recurrenceType.toLowerCase();

    console.log(`📊 [RECURRENCE TYPE CALC] Starting calculation for ${type}:`, {
      interval,
      periodMonth,
      startMonth,
      weekdays: weekdays || 'not provided',
      weekdaysLength: weekdays ? weekdays.length : 'N/A'
    });

    try {
      switch (type) {
        case 'daily':
          return this.calculateDailyOccurrences(interval);

        case 'weekly':
          return this.calculateWeeklyOccurrencesEnhanced(interval, weekdays);

        case 'monthly':
          return this.calculateMonthlyOccurrences_Internal(interval);

        case 'quarterly':
          return this.calculateQuarterlyOccurrences(interval, periodMonth, startMonth);

        default:
          console.warn(`⚠️ [RECURRENCE TYPE CALC] Unknown recurrence type: ${recurrenceType}`);
          return 0;
      }
    } catch (calculationError) {
      console.error(`❌ [RECURRENCE TYPE CALC] Error calculating ${type} occurrences:`, {
        recurrenceType,
        interval,
        weekdays,
        error: calculationError
      });
      
      // Return 0 for failed calculations to prevent system crashes
      return 0;
    }
  }

  /**
   * Calculate daily occurrences
   */
  private static calculateDailyOccurrences(interval: number): number {
    if (interval <= 0) {
      throw new Error(`Invalid daily interval: ${interval}. Must be greater than 0.`);
    }

    const occurrences = 30 / interval;
    console.log(`📅 [DAILY] Calculation: 30 days ÷ ${interval} interval = ${occurrences} occurrences`);
    return occurrences;
  }

  /**
   * Enhanced weekly occurrences calculation with comprehensive error handling
   */
  private static calculateWeeklyOccurrencesEnhanced(interval: number, weekdays?: number[]): number {
    console.log(`📅 [WEEKLY] Starting enhanced weekly calculation:`, {
      interval,
      weekdays,
      hasWeekdays: !!weekdays && weekdays.length > 0
    });

    // Validate interval
    if (interval <= 0) {
      throw new Error(`Invalid weekly interval: ${interval}. Must be greater than 0.`);
    }

    // Handle legacy behavior - no weekdays specified
    if (!weekdays || weekdays.length === 0) {
      const legacyOccurrences = 4.33 / interval;
      console.log(`📅 [WEEKLY - LEGACY] No weekdays specified, using legacy formula: 4.33 ÷ ${interval} = ${legacyOccurrences} occurrences`);
      return legacyOccurrences;
    }

    try {
      // Validate and normalize weekdays
      const validationResult = WeekdayUtils.validateAndNormalizeWeekdays(weekdays);
      
      if (!validationResult.isValid) {
        console.warn(`⚠️ [WEEKLY] Weekdays validation failed, falling back to legacy calculation:`, validationResult.errors);
        return 4.33 / interval;
      }

      // Handle empty valid weekdays (after validation)
      if (validationResult.validWeekdays.length === 0) {
        console.warn(`⚠️ [WEEKLY] No valid weekdays after validation, using legacy calculation`);
        return 4.33 / interval;
      }

      // Calculate using validated weekdays
      const calculationResult = WeekdayUtils.calculateWeeklyOccurrences(
        validationResult.validWeekdays,
        interval
      );

      console.log(`📅 [WEEKLY - ENHANCED] Calculation complete:`, {
        originalWeekdays: weekdays,
        validWeekdays: validationResult.validWeekdays,
        weekdayNames: calculationResult.details.weekdayNames,
        calculation: calculationResult.calculation,
        result: calculationResult.occurrences.toFixed(4)
      });

      return calculationResult.occurrences;

    } catch (weekdayError) {
      console.error(`❌ [WEEKLY] Error in weekday calculation, falling back to legacy:`, {
        weekdays,
        interval,
        error: weekdayError
      });
      
      // Fallback to legacy calculation on any error
      return 4.33 / interval;
    }
  }

  /**
   * Calculate monthly occurrences
   */
  private static calculateMonthlyOccurrences_Internal(interval: number): number {
    if (interval <= 0) {
      throw new Error(`Invalid monthly interval: ${interval}. Must be greater than 0.`);
    }

    const occurrences = 1 / interval;
    console.log(`📅 [MONTHLY] Calculation: 1 ÷ ${interval} interval = ${occurrences} occurrences`);
    return occurrences;
  }

  /**
   * Calculate quarterly occurrences
   */
  private static calculateQuarterlyOccurrences(
    interval: number,
    periodMonth: number,
    startMonth: number
  ): number {
    if (interval <= 0) {
      throw new Error(`Invalid quarterly interval: ${interval}. Must be greater than 0.`);
    }

    // Determine the position within the on/off quarterly cycle
    const cycleLength = interval * 6; // 3 months on, 3 months off per interval
    const monthsFromStart = (periodMonth - startMonth + 12) % 12;
    const cyclePosition = monthsFromStart % cycleLength;
    const occurrences = cyclePosition < 3 ? 1 / interval : 0;
    
    console.log(`📅 [QUARTERLY] Calculation:`, {
      interval,
      periodMonth,
      startMonth,
      cycleLength,
      monthsFromStart,
      cyclePosition,
      result: occurrences
    });
    
    return occurrences;
  }

  /**
   * Check if recurrence type is annual
   */
  static isAnnualRecurrence(recurrenceType: string): boolean {
    return recurrenceType && recurrenceType.toLowerCase().includes('annual');
  }

  /**
   * Get human-readable description of weekly recurrence with enhanced weekdays support
   */
  static getWeeklyRecurrenceDescription(interval: number, weekdays?: number[]): string {
    try {
      const baseInterval = interval === 1 ? 'every week' : `every ${interval} weeks`;
      
      if (!weekdays || weekdays.length === 0) {
        return interval === 1 ? 'Every week' : `Every ${interval} weeks`;
      }

      const validationResult = WeekdayUtils.validateAndNormalizeWeekdays(weekdays);
      
      if (!validationResult.isValid || validationResult.validWeekdays.length === 0) {
        return interval === 1 ? 'Every week' : `Every ${interval} weeks`;
      }

      const description = WeekdayUtils.getWeekdaysDescription(validationResult.validWeekdays);
      return `${description} ${baseInterval}`;

    } catch (error) {
      console.warn(`⚠️ [RECURRENCE TYPE CALC] Error generating description:`, error);
      return interval === 1 ? 'Every week' : `Every ${interval} weeks`;
    }
  }

  /**
   * Validate recurrence parameters before calculation
   */
  static validateRecurrenceParameters(
    recurrenceType: string,
    interval: number,
    weekdays?: number[]
  ): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate recurrence type
    if (!recurrenceType || typeof recurrenceType !== 'string') {
      errors.push('Recurrence type is required and must be a string');
    }

    // Validate interval
    if (typeof interval !== 'number' || interval <= 0) {
      errors.push(`Invalid interval: ${interval}. Must be a positive number.`);
    }

    // Validate weekdays for weekly tasks
    if (recurrenceType?.toLowerCase() === 'weekly' && weekdays) {
      const weekdayValidation = WeekdayUtils.validateAndNormalizeWeekdays(weekdays);
      errors.push(...weekdayValidation.errors);
      warnings.push(...weekdayValidation.warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
