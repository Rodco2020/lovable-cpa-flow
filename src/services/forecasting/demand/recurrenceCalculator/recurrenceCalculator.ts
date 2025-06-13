
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
 * - Weekly tasks: Enhanced support for specific weekdays with proper validation
 * 
 * Key behaviors:
 * - Annual tasks use month_of_year (primary) or due_date (fallback) for month targeting
 * - Annual tasks return full hours only in target month, zero elsewhere
 * - Weekly tasks can specify weekdays for more accurate calculations
 * - Weekdays validation ensures data integrity
 * - Interval adjustments apply to all recurrence types
 */
export class RecurrenceCalculator {
  /**
   * Calculate monthly demand with proper annual task month-specific logic
   * and enhanced weekly task weekday support with comprehensive validation
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
      weekdays: task.weekdays,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    });

    try {
      // Enhanced input validation including weekdays
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

      // Determine start month for quarterly and other patterns that rely on a base month
      let startMonth = 0;
      if (task.month_of_year !== null && task.month_of_year !== undefined) {
        startMonth = task.month_of_year - 1; // convert 1-12 to 0-11
      } else if (task.due_date) {
        startMonth = MonthUtils.getMonthFromDate(task.due_date);
      }

      // Handle other recurrence types with enhanced weekly support and weekdays integration
      return this.calculateNonAnnualTaskDemand(
        task,
        recurrenceType,
        interval,
        periodMonth,
        startMonth
      );

    } catch (error) {
      console.error(`❌ [RECURRENCE CALC] Error calculating recurrence for task ${task.id}:`, error);
      return this.createEmptyResult(task.id);
    }
  }

  /**
   * Calculate demand for non-annual recurring tasks with enhanced weekly support
   * and proper weekdays parameter integration
   */
  private static calculateNonAnnualTaskDemand(
    task: RecurringTaskDB,
    recurrenceType: string,
    interval: number,
    periodMonth: number,
    startMonth: number
  ): RecurrenceCalculation {
    // Enhanced weekdays handling with detailed logging
    if (recurrenceType === 'weekly') {
      console.log(`📊 [RECURRENCE CALC] Processing weekly task with weekdays integration:`, {
        taskId: task.id,
        weekdays: task.weekdays,
        weekdaysType: typeof task.weekdays,
        isArray: Array.isArray(task.weekdays),
        weekdaysLength: task.weekdays ? task.weekdays.length : 'N/A'
      });

      // Validate weekdays if provided
      if (task.weekdays !== null && task.weekdays !== undefined) {
        const weekdaysValidation = ValidationUtils.validateWeekdaysArray(task.weekdays);
        if (!weekdaysValidation.isValid) {
          console.warn(`⚠️ [RECURRENCE CALC] Invalid weekdays for task ${task.id}:`, weekdaysValidation.errors);
          console.log(`📊 [RECURRENCE CALC] Falling back to legacy calculation for task ${task.id}`);
        } else {
          console.log(`✅ [RECURRENCE CALC] Weekdays validation passed for task ${task.id}:`, {
            originalWeekdays: task.weekdays,
            validatedWeekdays: weekdaysValidation.validWeekdays
          });
        }
      } else {
        console.log(`📊 [RECURRENCE CALC] No weekdays specified for task ${task.id}, using legacy calculation`);
      }
    }

    // Pass weekdays array for weekly tasks with proper type safety
    const weekdaysParameter = (recurrenceType === 'weekly' && task.weekdays) ? task.weekdays : undefined;
    
    console.log(`🔧 [RECURRENCE CALC] Calling RecurrenceTypeCalculator with parameters:`, {
      taskId: task.id,
      recurrenceType,
      interval,
      periodMonth,
      startMonth,
      weekdaysParameter,
      weekdaysPassedToCalculator: !!weekdaysParameter
    });

    const monthlyOccurrences = RecurrenceTypeCalculator.calculateMonthlyOccurrences(
      recurrenceType,
      interval,
      periodMonth,
      startMonth,
      weekdaysParameter
    );
    
    const monthlyHours = Number(task.estimated_hours) * monthlyOccurrences;

    console.log(`✅ [RECURRENCE CALC] Non-annual calculation complete:`, {
      taskId: task.id,
      recurrenceType: task.recurrence_type,
      weekdays: task.weekdays,
      weekdaysUsedInCalculation: weekdaysParameter,
      monthlyOccurrences: monthlyOccurrences.toFixed(4),
      monthlyHours: monthlyHours.toFixed(2),
      calculation: `${task.estimated_hours} × ${monthlyOccurrences.toFixed(4)} = ${monthlyHours.toFixed(2)}`,
      backwardCompatible: !weekdaysParameter ? 'Yes - using legacy formula' : 'No - using enhanced weekdays calculation'
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
