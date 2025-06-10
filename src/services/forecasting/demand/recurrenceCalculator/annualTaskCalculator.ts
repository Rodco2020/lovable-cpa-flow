
import { RecurringTaskDB } from '@/types/task';
import { RecurrenceCalculation } from '@/types/demand';
import { MonthUtils } from './monthUtils';

/**
 * Annual task calculation utilities
 */
export class AnnualTaskCalculator {
  /**
   * Calculate demand for annual tasks with month-specific logic
   * Returns full hours only for the target month, zero for all other months
   */
  static calculateAnnualTaskDemand(
    task: RecurringTaskDB,
    periodMonth: number,
    interval: number
  ): RecurrenceCalculation {
    console.log(`📆 [ANNUAL CALC] Processing annual task ${task.id}:`, {
      taskName: task.name,
      estimatedHours: task.estimated_hours,
      interval,
      periodMonth: periodMonth,
      periodMonthName: MonthUtils.getMonthName(periodMonth),
      dueDate: task.due_date,
      monthOfYear: task.month_of_year,
      dayOfMonth: task.day_of_month
    });

    const { targetMonth, dataSource } = this.determineTargetMonth(task, periodMonth);

    // Return hours only for the target month, zero for all others
    if (targetMonth !== null) {
      if (targetMonth === periodMonth) {
        return this.createIncludedResult(task, interval, targetMonth, dataSource);
      } else {
        return this.createExcludedResult(task, targetMonth, periodMonth, dataSource);
      }
    }

    // No month information available - exclude from all months
    console.warn(`⚠️ [ANNUAL CALC] Annual task ${task.id} has no month information. Excluding from all periods.`);
    return this.createEmptyResult(task.id);
  }

  /**
   * Determine the target month for an annual task
   */
  private static determineTargetMonth(task: RecurringTaskDB, periodMonth: number): {
    targetMonth: number | null;
    dataSource: string;
  } {
    // Strategy 1: Use month_of_year if available (most reliable)
    if (task.month_of_year !== null && task.month_of_year !== undefined) {
      const targetMonth = task.month_of_year - 1; // Convert 1-12 to 0-11
      const dataSource = `month_of_year (${task.month_of_year})`;
      console.log(`📅 [ANNUAL CALC] Using month_of_year: ${task.month_of_year} (${MonthUtils.getMonthName(targetMonth)})`);
      return { targetMonth, dataSource };
    }

    // Strategy 2: Use due_date if month_of_year is not available
    if (task.due_date) {
      const dueDate = new Date(task.due_date);
      const targetMonth = dueDate.getMonth(); // 0-11
      const dataSource = `due_date (${task.due_date})`;
      console.log(`📅 [ANNUAL CALC] Using due_date fallback: ${task.due_date} (month ${targetMonth} - ${MonthUtils.getMonthName(targetMonth)})`);
      return { targetMonth, dataSource };
    }

    return { targetMonth: null, dataSource: '' };
  }

  /**
   * Create result for included annual task (target month matches period month)
   */
  private static createIncludedResult(
    task: RecurringTaskDB,
    interval: number,
    targetMonth: number,
    dataSource: string
  ): RecurrenceCalculation {
    const occurrences = 1 / interval;
    const hours = Number(task.estimated_hours) * occurrences;
    
    console.log(`✅ [ANNUAL CALC] Task included - matches target month:`, {
      targetMonth,
      targetMonthName: MonthUtils.getMonthName(targetMonth),
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
  }

  /**
   * Create result for excluded annual task (target month doesn't match period month)
   */
  private static createExcludedResult(
    task: RecurringTaskDB,
    targetMonth: number,
    periodMonth: number,
    dataSource: string
  ): RecurrenceCalculation {
    console.log(`❌ [ANNUAL CALC] Task excluded - month mismatch:`, {
      targetMonth,
      targetMonthName: MonthUtils.getMonthName(targetMonth),
      periodMonth,
      periodMonthName: MonthUtils.getMonthName(periodMonth),
      dataSource,
      result: 'Zero hours returned'
    });
    
    return this.createEmptyResult(task.id);
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
}
