
/**
 * Recurrence type calculation utilities
 */
export class RecurrenceTypeCalculator {
  /**
   * Calculate monthly occurrences for non-annual recurrence types
   */
  static calculateMonthlyOccurrences(
    recurrenceType: string,
    interval: number,
    periodMonth: number,
    startMonth = 0
  ): number {
    const type = recurrenceType.toLowerCase();

    switch (type) {
      case 'daily':
        return 30 / interval;
      case 'weekly':
        return 4.33 / interval;
      case 'monthly':
        return 1 / interval;
      case 'quarterly': {
        // Determine the position within the on/off quarterly cycle
        const cycleLength = interval * 6; // 3 months on, 3 months off per interval
        const monthsFromStart = (periodMonth - startMonth + 12) % 12;
        const cyclePosition = monthsFromStart % cycleLength;
        return cyclePosition < 3 ? 1 / interval : 0;
      }
      default:
        console.warn(`⚠️ [RECURRENCE CALC] Unknown recurrence type: ${recurrenceType}`);
        return 0;
    }
  }

  /**
   * Check if recurrence type is annual
   */
  static isAnnualRecurrence(recurrenceType: string): boolean {
    return recurrenceType && recurrenceType.toLowerCase().includes('annual');
  }
}
