
/**
 * Recurrence type calculation utilities
 */
export class RecurrenceTypeCalculator {
  /**
   * Calculate monthly occurrences for non-annual recurrence types
   * Enhanced to support weekdays array for weekly tasks
   */
  static calculateMonthlyOccurrences(
    recurrenceType: string,
    interval: number,
    periodMonth: number,
    startMonth = 0,
    weekdays?: number[]
  ): number {
    const type = recurrenceType.toLowerCase();

    console.log(`📊 [RECURRENCE TYPE CALC] Calculating ${type} occurrences:`, {
      interval,
      periodMonth,
      startMonth,
      weekdays: weekdays || 'not provided'
    });

    switch (type) {
      case 'daily':
        const dailyOccurrences = 30 / interval;
        console.log(`📅 [DAILY] Result: ${dailyOccurrences} occurrences`);
        return dailyOccurrences;

      case 'weekly':
        return this.calculateWeeklyOccurrences(interval, weekdays);

      case 'monthly':
        const monthlyOccurrences = 1 / interval;
        console.log(`📅 [MONTHLY] Result: ${monthlyOccurrences} occurrences`);
        return monthlyOccurrences;

      case 'quarterly': {
        // Determine the position within the on/off quarterly cycle
        const cycleLength = interval * 6; // 3 months on, 3 months off per interval
        const monthsFromStart = (periodMonth - startMonth + 12) % 12;
        const cyclePosition = monthsFromStart % cycleLength;
        const quarterlyOccurrences = cyclePosition < 3 ? 1 / interval : 0;
        console.log(`📅 [QUARTERLY] Result: ${quarterlyOccurrences} occurrences (cycle position: ${cyclePosition})`);
        return quarterlyOccurrences;
      }

      default:
        console.warn(`⚠️ [RECURRENCE CALC] Unknown recurrence type: ${recurrenceType}`);
        return 0;
    }
  }

  /**
   * Enhanced weekly occurrences calculation with weekdays support
   */
  private static calculateWeeklyOccurrences(interval: number, weekdays?: number[]): number {
    // Backward compatibility: If no weekdays specified, use legacy formula
    if (!weekdays || weekdays.length === 0) {
      const legacyOccurrences = 4.33 / interval;
      console.log(`📅 [WEEKLY - LEGACY] No weekdays specified, using legacy formula: ${legacyOccurrences} occurrences`);
      return legacyOccurrences;
    }

    // Validate weekdays array
    const validWeekdays = this.validateWeekdays(weekdays);
    if (validWeekdays.length === 0) {
      console.warn(`⚠️ [WEEKLY] Invalid weekdays array, falling back to legacy formula`);
      return 4.33 / interval;
    }

    // Calculate occurrences based on selected weekdays
    // Average month has 30.44 days, which equals ~4.35 weeks
    // Each selected weekday occurs once per week
    const averageWeeksPerMonth = 30.44 / 7; // ~4.35 weeks
    const occurrencesPerWeek = validWeekdays.length;
    const monthlyOccurrences = (averageWeeksPerMonth * occurrencesPerWeek) / interval;

    console.log(`📅 [WEEKLY - ENHANCED] Calculation details:`, {
      validWeekdays: validWeekdays,
      weekdayCount: validWeekdays.length,
      averageWeeksPerMonth: averageWeeksPerMonth.toFixed(2),
      occurrencesPerWeek,
      interval,
      monthlyOccurrences: monthlyOccurrences.toFixed(2)
    });

    return monthlyOccurrences;
  }

  /**
   * Validate weekdays array and filter out invalid values
   */
  private static validateWeekdays(weekdays: number[]): number[] {
    if (!Array.isArray(weekdays)) {
      console.warn(`⚠️ [WEEKLY] Weekdays is not an array:`, weekdays);
      return [];
    }

    const validWeekdays = weekdays.filter(day => {
      const isValid = Number.isInteger(day) && day >= 0 && day <= 6;
      if (!isValid) {
        console.warn(`⚠️ [WEEKLY] Invalid weekday value: ${day} (must be 0-6)`);
      }
      return isValid;
    });

    // Remove duplicates
    const uniqueWeekdays = [...new Set(validWeekdays)];
    
    if (uniqueWeekdays.length !== validWeekdays.length) {
      console.log(`📅 [WEEKLY] Removed duplicate weekdays, final count: ${uniqueWeekdays.length}`);
    }

    return uniqueWeekdays.sort();
  }

  /**
   * Check if recurrence type is annual
   */
  static isAnnualRecurrence(recurrenceType: string): boolean {
    return recurrenceType && recurrenceType.toLowerCase().includes('annual');
  }

  /**
   * Get human-readable description of weekly recurrence
   */
  static getWeeklyRecurrenceDescription(interval: number, weekdays?: number[]): string {
    const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    if (!weekdays || weekdays.length === 0) {
      return interval === 1 ? 'Every week' : `Every ${interval} weeks`;
    }

    const validWeekdays = this.validateWeekdays(weekdays);
    if (validWeekdays.length === 0) {
      return interval === 1 ? 'Every week' : `Every ${interval} weeks`;
    }

    const dayNames = validWeekdays.map(day => weekdayNames[day]).join(', ');
    const intervalText = interval === 1 ? 'every week' : `every ${interval} weeks`;
    
    return `${dayNames} ${intervalText}`;
  }
}
