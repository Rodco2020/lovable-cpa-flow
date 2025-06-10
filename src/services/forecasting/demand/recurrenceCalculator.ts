import { debugLog } from '../logger';
import { RecurrenceCalculation } from '@/types/demand';
import { RecurringTaskDB } from '@/types/task';

/**
 * Enhanced Recurrence Calculator with Fixed Annual Task Month-Specific Logic
 */
export class RecurrenceCalculator {
  /**
   * FIXED: Calculate monthly demand with proper annual task month-specific logic
   */
  static calculateMonthlyDemand(
    task: RecurringTaskDB,
    startDate: Date,
    endDate: Date
  ): RecurrenceCalculation {
    console.log(`🔄 [RECURRENCE CALC] Calculating for task ${task.id}:`, {
      taskName: task.name,
      estimatedHours: task.estimated_hours,
      recurrenceType: task.recurrence_type,
      recurrenceInterval: task.recurrence_interval,
      dueDate: task.due_date,
      monthOfYear: task.month_of_year,
      dayOfMonth: task.day_of_month,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    });

    try {
      // Enhanced input validation
      const validationResult = this.validateTaskInputs(task);
      if (!validationResult.isValid) {
        console.warn(`⚠️ [RECURRENCE CALC] Validation failed for task ${task.id}:`, validationResult.errors);
        return this.createEmptyResult(task.id);
      }

      const recurrenceType = task.recurrence_type.toLowerCase();
      const interval = Math.max(1, task.recurrence_interval || 1);
      const periodMonth = startDate.getMonth(); // 0-11

      console.log(`📅 [RECURRENCE CALC] Processing ${recurrenceType} task for period month ${periodMonth} (${this.getMonthName(periodMonth)})`);

      // FIXED: Handle annual tasks with month-specific logic
      if (recurrenceType === 'annually' || recurrenceType === 'annual') {
        return this.calculateAnnualTaskDemand(task, periodMonth, interval);
      }

      // Handle other recurrence types with existing logic
      let monthlyOccurrences = 0;

      switch (recurrenceType) {
        case 'daily':
          monthlyOccurrences = 30 / interval;
          break;
        case 'weekly':
          monthlyOccurrences = 4.33 / interval;
          break;
        case 'monthly':
          monthlyOccurrences = 1 / interval;
          break;
        case 'quarterly':
          monthlyOccurrences = (1 / interval) / 3;
          break;
        default:
          console.warn(`⚠️ [RECURRENCE CALC] Unknown recurrence type: ${task.recurrence_type}`);
          monthlyOccurrences = 0;
          break;
      }

      const monthlyHours = Number(task.estimated_hours) * monthlyOccurrences;

      console.log(`✅ [RECURRENCE CALC] Non-annual calculation complete:`, {
        taskId: task.id,
        recurrenceType: task.recurrence_type,
        monthlyOccurrences,
        monthlyHours,
        calculation: `${task.estimated_hours} × ${monthlyOccurrences} = ${monthlyHours}`
      });

      return {
        monthlyOccurrences: Math.max(0, monthlyOccurrences),
        monthlyHours: Math.max(0, monthlyHours),
        taskId: task.id,
        nextDueDates: []
      };

    } catch (error) {
      console.error(`❌ [RECURRENCE CALC] Error calculating recurrence for task ${task.id}:`, error);
      return this.createEmptyResult(task.id);
    }
  }

  /**
   * FIXED: Calculate demand for annual tasks with month-specific logic
   * Returns full hours only for the target month, zero for all other months
   */
  private static calculateAnnualTaskDemand(
    task: RecurringTaskDB,
    periodMonth: number,
    interval: number
  ): RecurrenceCalculation {
    console.log(`📆 [ANNUAL CALC] Processing annual task ${task.id}:`, {
      taskName: task.name,
      estimatedHours: task.estimated_hours,
      interval,
      periodMonth: periodMonth,
      periodMonthName: this.getMonthName(periodMonth),
      dueDate: task.due_date,
      monthOfYear: task.month_of_year,
      dayOfMonth: task.day_of_month
    });

    let targetMonth: number | null = null;
    let dataSource = '';

    // Strategy 1: Use month_of_year if available (most reliable)
    if (task.month_of_year !== null && task.month_of_year !== undefined) {
      targetMonth = task.month_of_year - 1; // Convert 1-12 to 0-11
      dataSource = `month_of_year (${task.month_of_year})`;
      console.log(`📅 [ANNUAL CALC] Using month_of_year: ${task.month_of_year} (${this.getMonthName(targetMonth)})`);
    }
    // Strategy 2: Use due_date if month_of_year is not available
    else if (task.due_date) {
      const dueDate = new Date(task.due_date);
      targetMonth = dueDate.getMonth(); // 0-11
      dataSource = `due_date (${task.due_date})`;
      console.log(`📅 [ANNUAL CALC] Using due_date fallback: ${task.due_date} (month ${targetMonth} - ${this.getMonthName(targetMonth)})`);
    }

    // FIXED: Return hours only for the target month, zero for all others
    if (targetMonth !== null) {
      if (targetMonth === periodMonth) {
        // This is the target month - return full hours adjusted for interval
        const occurrences = 1 / interval;
        const hours = Number(task.estimated_hours) * occurrences;
        
        console.log(`✅ [ANNUAL CALC] Task included - matches target month:`, {
          targetMonth,
          targetMonthName: this.getMonthName(targetMonth),
          periodMonth,
          periodMonthName: this.getMonthName(periodMonth),
          occurrences,
          hours,
          calculation: `${task.estimated_hours} × ${occurrences} = ${hours}`,
          dataSource
        });
        
        return {
          monthlyOccurrences: occurrences,
          monthlyHours: hours,
          taskId: task.id,
          nextDueDates: []
        };
      } else {
        // This is NOT the target month - return zero
        console.log(`❌ [ANNUAL CALC] Task excluded - month mismatch:`, {
          targetMonth,
          targetMonthName: this.getMonthName(targetMonth),
          periodMonth,
          periodMonthName: this.getMonthName(periodMonth),
          dataSource,
          result: 'Zero hours returned'
        });
        
        return this.createEmptyResult(task.id);
      }
    }

    // Strategy 3: No month information available - exclude from all months
    console.warn(`⚠️ [ANNUAL CALC] Annual task ${task.id} has no month information (month_of_year: ${task.month_of_year}, due_date: ${task.due_date}). Excluding from all periods.`);
    
    return this.createEmptyResult(task.id);
  }

  /**
   * Enhanced input validation for tasks
   */
  private static validateTaskInputs(task: RecurringTaskDB): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate basic required fields
    if (!task || !task.id) {
      errors.push('Task ID is missing');
    }

    if (typeof task.estimated_hours !== 'number' || task.estimated_hours <= 0) {
      errors.push(`Invalid estimated_hours: ${task.estimated_hours}`);
    }

    if (!task.recurrence_type || typeof task.recurrence_type !== 'string') {
      errors.push(`Invalid recurrence_type: ${task.recurrence_type}`);
    }

    // Annual task specific validation
    if (task.recurrence_type && task.recurrence_type.toLowerCase().includes('annual')) {
      if (!task.month_of_year && !task.due_date) {
        errors.push('Annual task missing both month_of_year and due_date');
      }

      if (task.month_of_year !== null && task.month_of_year !== undefined) {
        if (task.month_of_year < 1 || task.month_of_year > 12) {
          errors.push(`Invalid month_of_year: ${task.month_of_year} (must be 1-12)`);
        }
      }

      if (task.day_of_month !== null && task.day_of_month !== undefined) {
        if (task.day_of_month < 1 || task.day_of_month > 31) {
          errors.push(`Invalid day_of_month: ${task.day_of_month} (must be 1-31)`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Create an empty result for failed calculations
   */
  private static createEmptyResult(taskId: string): RecurrenceCalculation {
    return {
      monthlyOccurrences: 0,
      monthlyHours: 0,
      taskId,
      nextDueDates: []
    };
  }

  /**
   * Get month name for logging (0-11 index)
   */
  private static getMonthName(monthIndex: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex] || `Invalid(${monthIndex})`;
  }

  /**
   * Utility method to check if a date falls within a period
   */
  static isDateInPeriod(date: Date, startDate: Date, endDate: Date): boolean {
    return date >= startDate && date <= endDate;
  }

  /**
   * Utility method to get the month number (0-11) from a date string or Date object
   */
  static getMonthFromDate(date: string | Date): number {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.getMonth();
  }
}
