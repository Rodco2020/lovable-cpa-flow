
/**
 * Recurrence type calculation utilities
 */
export class RecurrenceTypeCalculator {
  /**
   * Calculate monthly occurrences for non-annual recurrence types
   */
  static calculateMonthlyOccurrences(recurrenceType: string, interval: number): number {
    const type = recurrenceType.toLowerCase();

    switch (type) {
      case 'daily':
        return 30 / interval;
      case 'weekly':
        return 4.33 / interval;
      case 'monthly':
        return 1 / interval;
      case 'quarterly':
        return (1 / interval) / 3;
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
