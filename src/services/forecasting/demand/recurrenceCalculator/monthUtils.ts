
/**
 * Month utilities for date calculations
 */
export class MonthUtils {
  /**
   * Get month name from 0-based index
   * 
   * @param monthIndex 0-based month index (0=January)
   * @returns Month name
   */
  static getMonthName(monthIndex: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex] || 'Invalid Month';
  }

  /**
   * Check if a month index is valid
   * 
   * @param monthIndex Month index to validate
   * @returns boolean indicating validity
   */
  static isValidMonth(monthIndex: number): boolean {
    return Number.isInteger(monthIndex) && monthIndex >= 0 && monthIndex <= 11;
  }

  /**
   * Convert 1-based month to 0-based
   * 
   * @param oneBasedMonth 1-based month (1=January)
   * @returns 0-based month (0=January)
   */
  static oneBasedToZeroBased(oneBasedMonth: number): number {
    return oneBasedMonth - 1;
  }

  /**
   * Convert 0-based month to 1-based
   * 
   * @param zeroBasedMonth 0-based month (0=January)
   * @returns 1-based month (1=January)
   */
  static zeroBasedToOneBased(zeroBasedMonth: number): number {
    return zeroBasedMonth + 1;
  }
}
