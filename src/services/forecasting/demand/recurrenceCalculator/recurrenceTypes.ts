
import { debugLog } from '../../logger';

/**
 * Recurrence Type Calculator
 * Handles calculation of monthly occurrences for different recurrence patterns
 * ENHANCED: Added detailed debugging for daily recurrence investigation
 */
export class RecurrenceTypeCalculator {
  /**
   * Calculate monthly occurrences based on recurrence type
   * ENHANCED: Added detailed debugging for daily recurrence patterns
   */
  static calculateMonthlyOccurrences(
    recurrenceType: string,
    interval: number,
    periodMonth: number,
    startMonth: number
  ): number {
    const type = recurrenceType.toLowerCase();
    
    console.log(`🔢 [RECURRENCE TYPE] Calculating occurrences for ${type} with interval ${interval}`);
    
    switch (type) {
      case 'daily':
        // ENHANCED: Detailed debugging for daily recurrence calculation
        const daysInMonth = this.getDaysInMonth(periodMonth);
        const dailyOccurrences = Math.floor(daysInMonth / interval);
        
        console.log(`🧐 [DAILY DEBUG] Daily recurrence calculation:`, {
          recurrenceType: type,
          interval,
          periodMonth,
          daysInMonth,
          calculation: `${daysInMonth} days ÷ ${interval} interval = ${dailyOccurrences} occurrences`,
          note: 'System counts ALL days in month (including weekends)',
          businessDaysEstimate: '~22 business days in typical month',
          discrepancyNote: dailyOccurrences > 22 ? 'This explains why daily tasks show more hours than manual calculation' : 'Calculation matches business day expectation'
        });
        
        return dailyOccurrences;
        
      case 'weekly':
        // Approximately 4.3 weeks per month
        const weeklyOccurrences = Math.floor(4.3 / interval);
        console.log(`📅 [WEEKLY] ${weeklyOccurrences} occurrences (4.3 weeks ÷ ${interval})`);
        return weeklyOccurrences;
        
      case 'monthly':
        const monthlyOccurrences = interval === 1 ? 1 : (interval <= 12 ? Math.floor(12 / interval) : 0);
        console.log(`📆 [MONTHLY] ${monthlyOccurrences} occurrences (interval: ${interval})`);
        return monthlyOccurrences;
        
      case 'quarterly':
        // Check if this month aligns with quarterly pattern starting from startMonth
        const monthsFromStart = (periodMonth - startMonth + 12) % 12;
        const quarterlyOccurrences = monthsFromStart % (3 * interval) === 0 ? 1 : 0;
        console.log(`📈 [QUARTERLY] ${quarterlyOccurrences} occurrences (months from start: ${monthsFromStart})`);
        return quarterlyOccurrences;
        
      default:
        console.warn(`⚠️ [RECURRENCE TYPE] Unknown recurrence type: ${type}, defaulting to 0`);
        return 0;
    }
  }

  /**
   * Check if recurrence type is annual
   */
  static isAnnualRecurrence(recurrenceType: string): boolean {
    const type = recurrenceType.toLowerCase();
    return type === 'annual' || type === 'annually' || type === 'yearly';
  }

  /**
   * Get number of days in a month (using current year)
   * ENHANCED: Added detailed logging for investigation
   */
  private static getDaysInMonth(month: number): number {
    const currentYear = new Date().getFullYear();
    const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
    
    console.log(`📅 [DAYS IN MONTH] Month ${month} (${this.getMonthName(month)}) has ${daysInMonth} days in ${currentYear}`);
    return daysInMonth;
  }

  /**
   * Get month name for debugging
   */
  private static getMonthName(month: number): string {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[month] || 'Unknown';
  }
}
