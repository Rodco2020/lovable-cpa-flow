
import { RecurringTaskDB } from '@/types/task';

/**
 * Annual Task Calculator for handling yearly recurring tasks
 * 
 * This calculator determines whether annual tasks should be included
 * in monthly demand calculations based on their month_of_year or due_date.
 */
export class AnnualTaskCalculator {
  /**
   * Calculate annual task occurrences for a given month
   * 
   * @param task The annual recurring task
   * @param startDate Start of the calculation period
   * @param endDate End of the calculation period
   * @returns Number of occurrences (0 or adjusted for interval)
   */
  static calculateAnnualOccurrences(
    task: RecurringTaskDB,
    startDate: Date,
    endDate: Date
  ): number {
    const periodMonth = startDate.getMonth(); // 0-based (0=January, 11=December)
    const interval = task.recurrence_interval || 1;

    // Check if task should occur in this month
    let targetMonth: number | null = null;

    // Priority 1: Use month_of_year if available (1-based)
    if (task.month_of_year !== null && task.month_of_year !== undefined) {
      targetMonth = task.month_of_year - 1; // Convert to 0-based
    }
    // Priority 2: Use due_date if month_of_year not available
    else if (task.due_date) {
      const dueDate = new Date(task.due_date);
      targetMonth = dueDate.getMonth(); // Already 0-based
    }

    // If no month information available, exclude from all months
    if (targetMonth === null) {
      return 0;
    }

    // Check if current period matches target month
    if (periodMonth === targetMonth) {
      // Return occurrence adjusted for interval (e.g., every 2 years = 0.5 occurrence per year)
      return 1 / interval;
    }

    // Not the target month, return 0
    return 0;
  }

  /**
   * Check if an annual task should be included in the given month
   * 
   * @param task The annual recurring task
   * @param monthIndex 0-based month index (0=January, 11=December)
   * @returns boolean indicating if task should be included
   */
  static shouldIncludeInMonth(task: RecurringTaskDB, monthIndex: number): boolean {
    return this.calculateAnnualOccurrences(
      task,
      new Date(2025, monthIndex, 1),
      new Date(2025, monthIndex + 1, 0)
    ) > 0;
  }
}
