
import { debugLog } from '../../logger';
import { RecurrenceCalculation } from '@/types/demand';
import { RecurringTaskDB } from '@/types/task';
import { ValidationUtils } from './validationUtils';
import { MonthUtils } from './monthUtils';
import { AnnualTaskCalculator } from './annualTaskCalculator';
import { RecurrenceTypeCalculator } from './recurrenceTypes';

/**
 * Enhanced Recurrence Calculator with modular architecture
 * 
 * This calculator handles different types of recurring tasks:
 * - Annual tasks: Only generate hours for their specific target month
 * - Non-annual tasks: Distribute hours based on recurrence pattern
 * 
 * Key behaviors:
 * - Annual tasks use month_of_year (primary) or due_date (fallback) for month targeting
 * - Annual tasks return full hours only in target month, zero elsewhere
 * - Interval adjustments apply to all recurrence types
 */
export class RecurrenceCalculator {
  /**
   * Calculate monthly demand with proper annual task month-specific logic
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
      const validationResult = ValidationUtils.validateTaskInputs(task);
      if (!validationResult.isValid) {
        console.warn(`⚠️ [RECURRENCE CALC] Validation failed for task ${task.id}:`, validationResult.errors);
        return this.createEmptyResult(task.id);
      }

      const recurrenceType = task.recurrence_type.toLowerCase();
      const interval = Math.max(1, task.recurrence_interval || 1);
      const periodMonth = startDate.getMonth(); // 0-11

      console.log(`📅 [RECURRENCE CALC] Processing ${recurrenceType} task for period month ${periodMonth} (${MonthUtils.getMonthName(periodMonth)})`);

      // Handle annual tasks with month-specific logic
      if (RecurrenceTypeCalculator.isAnnualRecurrence(recurrenceType)) {
        return AnnualTaskCalculator.calculateAnnualTaskDemand(task, periodMonth, interval);
      }

      // Handle other recurrence types
      return this.calculateNonAnnualTaskDemand(task, recurrenceType, interval);

    } catch (error) {
      console.error(`❌ [RECURRENCE CALC] Error calculating recurrence for task ${task.id}:`, error);
      return this.createEmptyResult(task.id);
    }
  }

  /**
   * Calculate demand for non-annual recurring tasks
   */
  private static calculateNonAnnualTaskDemand(
    task: RecurringTaskDB,
    recurrenceType: string,
    interval: number
  ): RecurrenceCalculation {
    const monthlyOccurrences = RecurrenceTypeCalculator.calculateMonthlyOccurrences(recurrenceType, interval);
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

  // Re-export utility methods for backward compatibility
  static isDateInPeriod = MonthUtils.isDateInPeriod;
  static getMonthFromDate = MonthUtils.getMonthFromDate;
}
