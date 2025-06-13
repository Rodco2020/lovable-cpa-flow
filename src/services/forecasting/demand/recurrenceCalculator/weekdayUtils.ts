
/**
 * Weekday utility helper for consistent weekday calculations and validation
 * Provides centralized weekday handling across the forecasting system
 */
export class WeekdayUtils {
  /**
   * Standard weekday names (0 = Sunday, 6 = Saturday)
   */
  static readonly WEEKDAY_NAMES = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
    'Thursday', 'Friday', 'Saturday'
  ] as const;

  /**
   * Valid weekday range
   */
  static readonly MIN_WEEKDAY = 0;
  static readonly MAX_WEEKDAY = 6;

  /**
   * Average weeks per month for calculations
   */
  static readonly AVERAGE_WEEKS_PER_MONTH = 30.44 / 7; // ~4.35 weeks

  /**
   * Validate and normalize weekdays array
   */
  static validateAndNormalizeWeekdays(weekdays: any): {
    isValid: boolean;
    errors: string[];
    validWeekdays: number[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const validWeekdays: number[] = [];

    console.log(`📅 [WEEKDAY UTILS] Validating weekdays input:`, {
      input: weekdays,
      type: typeof weekdays,
      isArray: Array.isArray(weekdays),
      length: Array.isArray(weekdays) ? weekdays.length : 'N/A'
    });

    // Check if weekdays is an array
    if (!Array.isArray(weekdays)) {
      const error = `Weekdays must be an array, received: ${typeof weekdays}`;
      errors.push(error);
      console.error(`❌ [WEEKDAY UTILS] ${error}`);
      return { isValid: false, errors, validWeekdays: [], warnings };
    }

    // Handle empty array (valid - falls back to legacy calculation)
    if (weekdays.length === 0) {
      const warning = 'Empty weekdays array provided, will use legacy calculation';
      warnings.push(warning);
      console.warn(`⚠️ [WEEKDAY UTILS] ${warning}`);
      return { isValid: true, errors: [], validWeekdays: [], warnings };
    }

    // Validate each weekday value
    const invalidEntries: { value: any; index: number; reason: string }[] = [];
    const duplicates: number[] = [];
    const seenWeekdays = new Set<number>();

    weekdays.forEach((day, index) => {
      // Check if it's a number
      if (typeof day !== 'number') {
        invalidEntries.push({
          value: day,
          index,
          reason: `Expected number, got ${typeof day}`
        });
        return;
      }

      // Check if it's an integer
      if (!Number.isInteger(day)) {
        invalidEntries.push({
          value: day,
          index,
          reason: 'Must be an integer'
        });
        return;
      }

      // Check if it's in valid range
      if (day < this.MIN_WEEKDAY || day > this.MAX_WEEKDAY) {
        invalidEntries.push({
          value: day,
          index,
          reason: `Out of range (must be ${this.MIN_WEEKDAY}-${this.MAX_WEEKDAY})`
        });
        return;
      }

      // Check for duplicates
      if (seenWeekdays.has(day)) {
        duplicates.push(day);
      } else {
        seenWeekdays.add(day);
        validWeekdays.push(day);
      }
    });

    // Report invalid entries
    if (invalidEntries.length > 0) {
      const errorDetails = invalidEntries.map(entry => 
        `${entry.value} at index ${entry.index} (${entry.reason})`
      ).join(', ');
      errors.push(`Invalid weekday values: ${errorDetails}`);
    }

    // Report duplicates as warnings
    if (duplicates.length > 0) {
      const uniqueDuplicates = [...new Set(duplicates)];
      warnings.push(`Duplicate weekdays removed: ${uniqueDuplicates.map(d => this.getWeekdayName(d)).join(', ')}`);
    }

    // Sort valid weekdays
    validWeekdays.sort();

    // Final validation - ensure we have at least one valid weekday if input wasn't empty
    if (weekdays.length > 0 && validWeekdays.length === 0) {
      errors.push('No valid weekdays found after validation');
    }

    const result = {
      isValid: errors.length === 0,
      errors,
      validWeekdays,
      warnings
    };

    console.log(`✅ [WEEKDAY UTILS] Validation complete:`, {
      originalCount: weekdays.length,
      validCount: validWeekdays.length,
      duplicatesRemoved: duplicates.length,
      invalidCount: invalidEntries.length,
      isValid: result.isValid,
      validWeekdays: validWeekdays.map(d => `${d}(${this.getWeekdayName(d)})`).join(', ')
    });

    return result;
  }

  /**
   * Get weekday name by number
   */
  static getWeekdayName(weekday: number): string {
    if (weekday < this.MIN_WEEKDAY || weekday > this.MAX_WEEKDAY) {
      return `Invalid(${weekday})`;
    }
    return this.WEEKDAY_NAMES[weekday];
  }

  /**
   * Calculate monthly occurrences for specific weekdays
   */
  static calculateWeeklyOccurrences(
    validWeekdays: number[],
    interval: number = 1
  ): {
    occurrences: number;
    calculation: string;
    details: {
      weekdayCount: number;
      averageWeeksPerMonth: number;
      interval: number;
      weekdayNames: string[];
    };
  } {
    if (validWeekdays.length === 0) {
      throw new Error('Cannot calculate occurrences for empty weekdays array');
    }

    if (interval <= 0) {
      throw new Error(`Invalid interval: ${interval}. Must be greater than 0.`);
    }

    const weekdayCount = validWeekdays.length;
    const occurrencesPerWeek = weekdayCount;
    const monthlyOccurrences = (this.AVERAGE_WEEKS_PER_MONTH * occurrencesPerWeek) / interval;

    const calculation = `(${this.AVERAGE_WEEKS_PER_MONTH.toFixed(2)} weeks/month × ${weekdayCount} days/week) ÷ ${interval} interval = ${monthlyOccurrences.toFixed(2)}`;
    
    const weekdayNames = validWeekdays.map(d => this.getWeekdayName(d));

    console.log(`📊 [WEEKDAY UTILS] Calculated weekly occurrences:`, {
      validWeekdays,
      weekdayNames,
      weekdayCount,
      interval,
      monthlyOccurrences: monthlyOccurrences.toFixed(4),
      calculation
    });

    return {
      occurrences: monthlyOccurrences,
      calculation,
      details: {
        weekdayCount,
        averageWeeksPerMonth: this.AVERAGE_WEEKS_PER_MONTH,
        interval,
        weekdayNames
      }
    };
  }

  /**
   * Get human-readable description of weekdays
   */
  static getWeekdaysDescription(weekdays: number[]): string {
    if (weekdays.length === 0) {
      return 'No specific days';
    }

    if (weekdays.length === 7) {
      return 'Every day';
    }

    // Check for common patterns
    const weekdaySet = new Set(weekdays);
    const weekdays_only = [1, 2, 3, 4, 5];
    const weekend_only = [0, 6];

    if (weekdays_only.every(day => weekdaySet.has(day)) && weekdays.length === 5) {
      return 'Weekdays (Mon-Fri)';
    }

    if (weekend_only.every(day => weekdaySet.has(day)) && weekdays.length === 2) {
      return 'Weekends (Sat-Sun)';
    }

    // Default to listing all days
    const dayNames = weekdays.map(d => this.getWeekdayName(d));
    
    if (dayNames.length <= 3) {
      return dayNames.join(', ');
    } else {
      return `${dayNames.slice(0, 2).join(', ')} and ${dayNames.length - 2} more days`;
    }
  }

  /**
   * Create detailed error context for debugging
   */
  static createErrorContext(
    taskId: string,
    weekdays: any,
    validationResult?: ReturnType<typeof WeekdayUtils.validateAndNormalizeWeekdays>
  ): {
    taskId: string;
    originalWeekdays: any;
    weekdaysType: string;
    isArray: boolean;
    validationErrors?: string[];
    validationWarnings?: string[];
    suggestedFix: string;
  } {
    const context = {
      taskId,
      originalWeekdays: weekdays,
      weekdaysType: typeof weekdays,
      isArray: Array.isArray(weekdays),
      suggestedFix: 'Ensure weekdays is an array of integers between 0-6'
    };

    if (validationResult) {
      return {
        ...context,
        validationErrors: validationResult.errors,
        validationWarnings: validationResult.warnings,
        suggestedFix: validationResult.errors.length > 0 
          ? `Fix validation errors: ${validationResult.errors.join('; ')}`
          : 'Weekdays validation passed'
      };
    }

    return context;
  }
}
