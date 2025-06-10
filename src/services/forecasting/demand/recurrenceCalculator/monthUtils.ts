
/**
 * Month-related utility functions
 */
export class MonthUtils {
  private static readonly MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  /**
   * Get month name for logging (0-11 index)
   */
  static getMonthName(monthIndex: number): string {
    return this.MONTH_NAMES[monthIndex] || `Invalid(${monthIndex})`;
  }

  /**
   * Check if a date falls within a period
   */
  static isDateInPeriod(date: Date, startDate: Date, endDate: Date): boolean {
    return date >= startDate && date <= endDate;
  }

  /**
   * Get the month number (0-11) from a date string or Date object
   */
  static getMonthFromDate(date: string | Date): number {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.getMonth();
  }
}
