
import { RecurringTaskDB } from '@/types/task';

/**
 * Quarterly Task Calculator
 * 
 * This service handles accurate quarterly task calculations by determining
 * if the current month is a due month for the quarterly task based on
 * the task's due_date and recurrence interval.
 * 
 * CALCULATION METHODOLOGY:
 * 1. Parse the task's due_date to establish the quarterly schedule
 * 2. Calculate which months are due months based on the interval
 * 3. Return 1 occurrence for due months, 0 for non-due months
 * 
 * EXAMPLES:
 * - Task due 2024-03-15, interval 1: Due in March, June, September, December
 * - Task due 2024-01-31, interval 2: Due in January, July (every 6 months)
 * - Task due 2024-02-28, interval 3: Due in February (once per year)
 */
export class QuarterlyTaskCalculator {
  /**
   * Calculate quarterly occurrences for a specific month
   * 
   * @param task The quarterly recurring task
   * @param targetMonth The month to check (0-based: 0=January, 11=December)
   * @param targetYear The year to check
   * @returns Number of occurrences (0 or 1) for the target month
   */
  static calculateQuarterlyOccurrences(
    task: RecurringTaskDB,
    targetMonth: number,
    targetYear: number
  ): number {
    const taskId = task.id;
    const interval = task.recurrence_interval || 1;
    
    console.log(`📅 [QUARTERLY CALC] Calculating for task ${taskId}:`, {
      targetMonth: targetMonth + 1, // Convert to 1-based for logging
      targetYear,
      interval,
      dueDate: task.due_date
    });

    try {
      // Parse the due date to establish the base quarterly schedule
      const dueDate = this.parseDueDate(task.due_date);
      if (!dueDate) {
        console.warn(`⚠️ [QUARTERLY CALC] Invalid due_date for task ${taskId}:`, task.due_date);
        return 0;
      }

      const baseDueMonth = dueDate.getMonth(); // 0-based
      const baseDueYear = dueDate.getFullYear();

      console.log(`📅 [QUARTERLY CALC] Base due date for task ${taskId}:`, {
        baseDueMonth: baseDueMonth + 1, // Convert to 1-based for logging
        baseDueYear,
        parsedFrom: task.due_date
      });

      // Calculate if the target month is a due month
      const isDueMonth = this.isQuarterlyDueMonth(
        baseDueMonth,
        baseDueYear,
        targetMonth,
        targetYear,
        interval
      );

      const result = isDueMonth ? 1 : 0;

      console.log(`✅ [QUARTERLY CALC] Result for task ${taskId}:`, {
        targetMonth: targetMonth + 1,
        targetYear,
        isDueMonth,
        occurrences: result,
        calculation: `Base: ${baseDueMonth + 1}/${baseDueYear}, Interval: ${interval} quarters`
      });

      return result;

    } catch (error) {
      console.error(`❌ [QUARTERLY CALC] Error calculating for task ${taskId}:`, error);
      return 0;
    }
  }

  /**
   * Parse the due_date string to a Date object
   * Handles various date formats and null values
   */
  private static parseDueDate(dueDateString: string | null): Date | null {
    if (!dueDateString) {
      return null;
    }

    try {
      // Handle ISO date strings and various formats
      const date = new Date(dueDateString);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return null;
      }

      return date;
    } catch (error) {
      console.warn(`⚠️ [QUARTERLY CALC] Error parsing due_date:`, dueDateString, error);
      return null;
    }
  }

  /**
   * Determine if a target month/year is a due month for a quarterly task
   * 
   * @param baseDueMonth Base due month (0-based)
   * @param baseDueYear Base due year
   * @param targetMonth Target month to check (0-based)
   * @param targetYear Target year to check
   * @param interval Quarterly interval (1=quarterly, 2=semi-annually, etc.)
   * @returns true if the target month is a due month
   */
  private static isQuarterlyDueMonth(
    baseDueMonth: number,
    baseDueYear: number,
    targetMonth: number,
    targetYear: number,
    interval: number
  ): boolean {
    // Calculate the number of months between base and target
    const monthsDifference = (targetYear - baseDueYear) * 12 + (targetMonth - baseDueMonth);

    // For quarterly tasks: due every (3 * interval) months
    const quarterlyIntervalMonths = 3 * interval;

    // Check if the target month aligns with the quarterly schedule
    const isAligned = monthsDifference >= 0 && monthsDifference % quarterlyIntervalMonths === 0;

    console.log(`🔍 [QUARTERLY ALIGNMENT] Checking alignment:`, {
      baseDueMonth: baseDueMonth + 1,
      baseDueYear,
      targetMonth: targetMonth + 1,
      targetYear,
      monthsDifference,
      quarterlyIntervalMonths,
      isAligned,
      calculation: `${monthsDifference} % ${quarterlyIntervalMonths} = ${monthsDifference % quarterlyIntervalMonths}`
    });

    return isAligned;
  }

  /**
   * Get a human-readable description of the quarterly schedule
   * 
   * @param task The quarterly recurring task
   * @returns Description string for display purposes
   */
  static getQuarterlyDescription(task: RecurringTaskDB): string {
    const interval = task.recurrence_interval || 1;
    const dueDate = this.parseDueDate(task.due_date);
    
    if (!dueDate) {
      return `Every ${interval === 1 ? '' : interval + ' '}quarter(s)`;
    }

    const monthName = dueDate.toLocaleString('default', { month: 'long' });
    
    if (interval === 1) {
      return `Quarterly in ${monthName}`;
    } else if (interval === 2) {
      return `Semi-annually in ${monthName}`;
    } else if (interval === 4) {
      return `Annually in ${monthName}`;
    } else {
      return `Every ${interval} quarters starting ${monthName}`;
    }
  }
}
