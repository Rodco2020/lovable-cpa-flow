
/**
 * Weekday Utilities for Enhanced Weekly Recurring Task Calculations
 * 
 * WEEKDAY CALCULATION DOCUMENTATION:
 * 
 * This utility provides accurate weekday-based calculations for weekly recurring
 * tasks, replacing the previous fixed 4.33 weeks/month approximation with precise
 * mathematical calculations based on selected weekdays.
 * 
 * CORE CALCULATION METHODOLOGY:
 * 
 * 1. MATHEMATICAL FOUNDATION:
 *    - Average days per month: 30.44 (365.25 days/year ÷ 12 months)
 *    - Average weeks per month: 4.35 (30.44 ÷ 7)
 *    - This accounts for leap years and varying month lengths
 * 
 * 2. WEEKDAY-SPECIFIC CALCULATION:
 *    - Monthly occurrences = numberOfWeekdays × averageWeeksPerMonth ÷ recurrenceInterval
 *    - Example: 3 weekdays × 4.35 weeks ÷ 1 interval = 13.05 occurrences/month
 * 
 * 3. PRACTICAL EXAMPLES:
 *    - Task every Monday (weekdays: [1]): 1 × 4.35 = 4.35 occurrences/month
 *    - Task Mon/Wed/Fri (weekdays: [1,3,5]): 3 × 4.35 = 13.05 occurrences/month
 *    - Task Tue/Thu bi-weekly (weekdays: [2,4], interval: 2): 2 × 4.35 ÷ 2 = 4.35 occurrences/month
 * 
 * VALIDATION AND ERROR HANDLING:
 * - Validates weekday values (0-6, where 0=Sunday, 6=Saturday)
 * - Removes duplicates and sorts weekdays
 * - Provides descriptive error messages for invalid inputs
 * - Falls back gracefully when validation fails
 */

export interface WeekdayValidationResult {
  isValid: boolean;
  validWeekdays: number[];
  errors: string[];
  warnings: string[];
}

export interface WeekdayCalculationResult {
  occurrences: number;
  calculation: string;
  details: {
    weekdayCount: number;
    averageWeeksPerMonth: number;
    recurrenceInterval: number;
    weekdayNames: string[];
  };
}

export class WeekdayUtils {
  // Standard weekday names for logging and display purposes
  private static readonly WEEKDAY_NAMES = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  // Mathematical constant: average weeks per month (365.25 days/year ÷ 12 months ÷ 7 days/week)
  private static readonly AVERAGE_WEEKS_PER_MONTH = 30.44 / 7; // ≈ 4.35

  /**
   * Validate and normalize weekdays array with comprehensive error reporting
   * 
   * This method ensures weekday data integrity by validating values,
   * removing duplicates, and providing detailed error feedback for
   * troubleshooting purposes.
   * 
   * VALIDATION RULES:
   * - Weekday values must be integers between 0-6
   * - Duplicates are automatically removed with warnings
   * - Invalid values are filtered out with error reporting
   * - Empty results after filtering are flagged as invalid
   * 
   * @param weekdays Array of weekday integers (0=Sunday, 6=Saturday)
   * @returns WeekdayValidationResult with validation status and clean data
   */
  static validateAndNormalizeWeekdays(weekdays: any[]): WeekdayValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Type validation and filtering
    const numericWeekdays = weekdays.filter(day => {
      if (typeof day === 'number' && Number.isInteger(day)) {
        return true;
      }
      // Track invalid types for error reporting
      return false;
    });

    // Check for invalid types
    if (numericWeekdays.length < weekdays.length) {
      const invalidCount = weekdays.length - numericWeekdays.length;
      errors.push(`Invalid weekday values detected (${invalidCount} non-numeric values removed)`);
    }

    // Range validation (0-6 for Sunday-Saturday)
    const validWeekdays = numericWeekdays.filter(day => day >= 0 && day <= 6);
    
    if (validWeekdays.length < numericWeekdays.length) {
      const outOfRangeCount = numericWeekdays.length - validWeekdays.length;
      errors.push(`Weekday values out of range (${outOfRangeCount} values must be 0-6)`);
    }

    // Remove duplicates and track them
    const originalLength = validWeekdays.length;
    const uniqueWeekdays = [...new Set(validWeekdays)].sort();
    
    if (uniqueWeekdays.length < originalLength) {
      const duplicateCount = originalLength - uniqueWeekdays.length;
      warnings.push(`Duplicate weekdays removed (${duplicateCount} duplicates found)`);
    }

    // Special case warnings
    if (uniqueWeekdays.length === 7) {
      warnings.push('All 7 weekdays selected - consider using Daily recurrence instead');
    }

    // Final validation
    const isValid = uniqueWeekdays.length > 0 && errors.length === 0;

    return {
      isValid,
      validWeekdays: uniqueWeekdays,
      errors,
      warnings
    };
  }

  /**
   * Calculate weekly occurrences with enhanced weekday-based mathematics
   * 
   * This method implements the core weekday calculation algorithm that
   * provides accurate monthly occurrence estimates based on selected
   * weekdays and recurrence intervals.
   * 
   * CALCULATION FORMULA:
   * occurrences = numberOfWeekdays × averageWeeksPerMonth ÷ recurrenceInterval
   * 
   * MATHEMATICAL EXPLANATION:
   * - Each selected weekday occurs ~4.35 times per month on average
   * - Multiple weekdays multiply this base frequency
   * - Recurrence intervals (bi-weekly, tri-weekly) divide the frequency
   * 
   * @param weekdays Array of validated weekday integers
   * @param recurrenceInterval Interval between recurrences (1=weekly, 2=bi-weekly, etc.)
   * @returns WeekdayCalculationResult with occurrences and detailed breakdown
   */
  static calculateWeeklyOccurrences(
    weekdays: number[],
    recurrenceInterval: number
  ): WeekdayCalculationResult {
    // Input validation with descriptive errors
    if (!weekdays || weekdays.length === 0) {
      throw new Error('Cannot calculate occurrences for empty weekdays array');
    }

    if (recurrenceInterval <= 0) {
      throw new Error(`Invalid interval: ${recurrenceInterval}. Must be positive integer.`);
    }

    // Core weekday-based calculation
    const weekdayCount = weekdays.length;
    const occurrences = weekdayCount * this.AVERAGE_WEEKS_PER_MONTH / recurrenceInterval;
    
    // Generate human-readable calculation explanation
    const calculation = `${weekdayCount} weekdays × ${this.AVERAGE_WEEKS_PER_MONTH.toFixed(2)} weeks/month ÷ ${recurrenceInterval} interval = ${occurrences.toFixed(2)} occurrences/month`;
    
    // Create detailed breakdown for logging and debugging
    const weekdayNames = weekdays.map(day => this.WEEKDAY_NAMES[day] || `Invalid(${day})`);
    
    return {
      occurrences,
      calculation,
      details: {
        weekdayCount,
        averageWeeksPerMonth: this.AVERAGE_WEEKS_PER_MONTH,
        recurrenceInterval,
        weekdayNames
      }
    };
  }

  /**
   * Generate human-readable description of selected weekdays
   * 
   * This utility method creates user-friendly descriptions of weekday
   * selections for logging, debugging, and user interface purposes.
   * 
   * SPECIAL PATTERNS RECOGNIZED:
   * - Weekdays (Mon-Fri): "Weekdays (Mon-Fri)"
   * - Weekends (Sat-Sun): "Weekends (Sat-Sun)"
   * - Individual days: "Monday, Wednesday, Friday"
   * - Empty selection: "No specific days"
   * 
   * @param weekdays Array of weekday integers
   * @returns Human-readable description string
   */
  static getWeekdaysDescription(weekdays: number[]): string {
    if (!weekdays || weekdays.length === 0) {
      return 'No specific days';
    }

    const sortedWeekdays = [...weekdays].sort();
    
    // Check for common patterns
    const isWeekdays = JSON.stringify(sortedWeekdays) === JSON.stringify([1, 2, 3, 4, 5]);
    const isWeekends = JSON.stringify(sortedWeekdays) === JSON.stringify([0, 6]);
    
    if (isWeekdays) {
      return 'Weekdays (Mon-Fri)';
    }
    
    if (isWeekends) {
      return 'Weekends (Sat-Sun)';
    }
    
    // Generate individual day names
    const dayNames = sortedWeekdays.map(day => this.WEEKDAY_NAMES[day] || `Invalid(${day})`);
    return dayNames.join(', ');
  }

  /**
   * Get weekday name for display purposes
   * 
   * @param weekdayIndex Integer representing weekday (0=Sunday, 6=Saturday)
   * @returns String name of the weekday
   */
  static getWeekdayName(weekdayIndex: number): string {
    return this.WEEKDAY_NAMES[weekdayIndex] || `Invalid(${weekdayIndex})`;
  }

  /**
   * Check if weekdays array represents a common pattern
   * 
   * This utility helps identify common scheduling patterns for
   * optimization and user experience improvements.
   * 
   * @param weekdays Array of weekday integers
   * @returns Object describing the pattern type
   */
  static analyzeWeekdayPattern(weekdays: number[]): {
    isWeekdays: boolean;
    isWeekends: boolean;
    isDaily: boolean;
    isCustom: boolean;
    description: string;
  } {
    if (!weekdays || weekdays.length === 0) {
      return {
        isWeekdays: false,
        isWeekends: false,
        isDaily: false,
        isCustom: false,
        description: 'No days selected'
      };
    }

    const sortedWeekdays = [...weekdays].sort();
    const isWeekdays = JSON.stringify(sortedWeekdays) === JSON.stringify([1, 2, 3, 4, 5]);
    const isWeekends = JSON.stringify(sortedWeekdays) === JSON.stringify([0, 6]);
    const isDaily = sortedWeekdays.length === 7;
    const isCustom = !isWeekdays && !isWeekends && !isDaily;

    return {
      isWeekdays,
      isWeekends,
      isDaily,
      isCustom,
      description: this.getWeekdaysDescription(weekdays)
    };
  }
}
