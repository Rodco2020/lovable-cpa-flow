
import { debugLog } from '../../logger';
import { RecurrenceCalculation } from '@/types/demand';
import { RecurringTaskDB } from '@/types/task';
import { ValidationUtils } from './validationUtils';
import { WeekdayUtils } from './weekdayUtils';
import { MonthUtils } from './monthUtils';
import { AnnualTaskCalculator } from './annualTaskCalculator';
import { RecurrenceTypeCalculator } from './recurrenceTypes';

/**
 * Enhanced Recurrence Calculator with comprehensive error handling and validation
 * 
 * Phase 3 Enhancements:
 * - Robust error handling with graceful fallbacks
 * - Detailed logging for debugging and monitoring
 * - Enhanced weekdays validation and processing
 * - Comprehensive validation context for troubleshooting
 */
export class RecurrenceCalculator {
  /**
   * Calculate monthly demand with enhanced validation, error handling, and detailed logging
   */
  static calculateMonthlyDemand(
    task: RecurringTaskDB,
    startDate: Date,
    endDate: Date
  ): RecurrenceCalculation {
    const taskId = task?.id || 'unknown';
    
    console.log(`🔄 [RECURRENCE CALC] Starting calculation for task ${taskId}:`, {
      taskName: task?.name,
      estimatedHours: task?.estimated_hours,
      recurrenceType: task?.recurrence_type,
      recurrenceInterval: task?.recurrence_interval,
      weekdays: task?.weekdays,
      dateRange: {
        start: startDate?.toISOString(),
        end: endDate?.toISOString()
      }
    });

    try {
      // Enhanced input validation with detailed error context
      const validationResult = ValidationUtils.validateTaskInputs(task);
      
      if (!validationResult.isValid) {
        console.error(`❌ [RECURRENCE CALC] Validation failed for task ${taskId}:`, {
          errors: validationResult.errors,
          warnings: validationResult.warnings,
          context: validationResult.context
        });
        
        return this.createEmptyResultWithError(
          taskId, 
          'Validation failed',
          validationResult.errors
        );
      }

      // Log validation warnings if any
      if (validationResult.warnings && validationResult.warnings.length > 0) {
        console.warn(`⚠️ [RECURRENCE CALC] Validation warnings for task ${taskId}:`, validationResult.warnings);
      }

      // Proceed with calculation
      return this.performCalculation(task, startDate, endDate, validationResult);

    } catch (error) {
      console.error(`❌️ [RECURRENCE CALC] Critical error calculating recurrence for task ${taskId}:`, {
        error: error,
        errorMessage: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        taskData: this.createSafeTaskSummary(task)
      });
      
      return this.createEmptyResultWithError(
        taskId,
        'Calculation failed',
        [`Critical calculation error: ${error instanceof Error ? error.message : String(error)}`]
      );
    }
  }

  /**
   * Perform the actual calculation with enhanced error handling
   */
  private static performCalculation(
    task: RecurringTaskDB,
    startDate: Date,
    endDate: Date,
    validationResult: ReturnType<typeof ValidationUtils.validateTaskInputs>
  ): RecurrenceCalculation {
    const recurrenceType = task.recurrence_type.toLowerCase();
    const interval = Math.max(1, task.recurrence_interval || 1);
    const periodMonth = startDate.getMonth(); // 0-11
    const taskId = task.id;

    console.log(`📅 [RECURRENCE CALC] Processing ${recurrenceType} task for period month ${periodMonth} (${MonthUtils.getMonthName(periodMonth)})`);

    try {
      // Handle annual tasks with month-specific logic
      if (RecurrenceTypeCalculator.isAnnualRecurrence(recurrenceType)) {
        console.log(`📊 [RECURRENCE CALC] Processing annual task ${taskId}`);
        return AnnualTaskCalculator.calculateAnnualTaskDemand(task, periodMonth, interval);
      }

      // Handle non-annual tasks with enhanced weekdays support
      return this.calculateNonAnnualTaskDemandEnhanced(
        task,
        recurrenceType,
        interval,
        periodMonth,
        validationResult
      );

    } catch (calculationError) {
      console.error(`❌ [RECURRENCE CALC] Calculation error for task ${taskId}:`, {
        recurrenceType,
        interval,
        error: calculationError
      });
      
      return this.createEmptyResultWithError(
        taskId,
        'Calculation processing failed',
        [`Error in ${recurrenceType} calculation: ${calculationError}`]
      );
    }
  }

  /**
   * Calculate demand for non-annual recurring tasks with enhanced error handling
   */
  private static calculateNonAnnualTaskDemandEnhanced(
    task: RecurringTaskDB,
    recurrenceType: string,
    interval: number,
    periodMonth: number,
    validationResult: ReturnType<typeof ValidationUtils.validateTaskInputs>
  ): RecurrenceCalculation {
    const taskId = task.id;
    
    try {
      // Determine start month for calculations
      let startMonth = 0;
      if (task.month_of_year !== null && task.month_of_year !== undefined) {
        startMonth = task.month_of_year - 1; // convert 1-12 to 0-11
      } else if (task.due_date) {
        startMonth = MonthUtils.getMonthFromDate(task.due_date);
      }

      // Enhanced weekdays handling for weekly tasks
      let weekdaysParameter: number[] | undefined;
      
      if (recurrenceType === 'weekly') {
        weekdaysParameter = this.processWeekdaysForCalculation(task, taskId);
      }

      console.log(`🔧 [RECURRENCE CALC] Calling RecurrenceTypeCalculator with enhanced parameters:`, {
        taskId,
        recurrenceType,
        interval,
        periodMonth,
        startMonth,
        weekdaysParameter: weekdaysParameter || 'not provided',
        hasValidatedWeekdays: !!weekdaysParameter
      });

      // Validate parameters before calculation
      const paramValidation = RecurrenceTypeCalculator.validateRecurrenceParameters(
        recurrenceType,
        interval,
        weekdaysParameter
      );

      if (!paramValidation.isValid) {
        console.error(`❌ [RECURRENCE CALC] Parameter validation failed for task ${taskId}:`, paramValidation.errors);
        throw new Error(`Parameter validation failed: ${paramValidation.errors.join('; ')}`);
      }

      // Log parameter warnings
      if (paramValidation.warnings.length > 0) {
        console.warn(`⚠️ [RECURRENCE CALC] Parameter warnings for task ${taskId}:`, paramValidation.warnings);
      }

      // Perform calculation
      const monthlyOccurrences = RecurrenceTypeCalculator.calculateMonthlyOccurrences(
        recurrenceType,
        interval,
        periodMonth,
        startMonth,
        weekdaysParameter
      );
      
      const monthlyHours = Number(task.estimated_hours) * monthlyOccurrences;

      // Validate calculation results
      if (!Number.isFinite(monthlyOccurrences) || !Number.isFinite(monthlyHours)) {
        throw new Error(`Invalid calculation result: occurrences=${monthlyOccurrences}, hours=${monthlyHours}`);
      }

      console.log(`✅ [RECURRENCE CALC] Non-annual calculation complete for task ${taskId}:`, {
        recurrenceType: task.recurrence_type,
        weekdays: task.weekdays,
        weekdaysUsed: weekdaysParameter,
        monthlyOccurrences: monthlyOccurrences.toFixed(4),
        monthlyHours: monthlyHours.toFixed(2),
        calculation: `${task.estimated_hours} × ${monthlyOccurrences.toFixed(4)} = ${monthlyHours.toFixed(2)}`,
        enhancedMode: !!weekdaysParameter ? 'Enhanced weekdays calculation' : 'Legacy/standard calculation'
      });

      return {
        monthlyOccurrences: Math.max(0, monthlyOccurrences),
        monthlyHours: Math.max(0, monthlyHours),
        taskId: task.id,
        nextDueDates: []
      };

    } catch (calculationError) {
      console.error(`❌ [RECURRENCE CALC] Error in non-annual calculation for task ${taskId}:`, calculationError);
      throw calculationError; // Re-throw to be handled by parent
    }
  }

  /**
   * Process weekdays for calculation with enhanced validation and error handling
   */
  private static processWeekdaysForCalculation(task: RecurringTaskDB, taskId: string): number[] | undefined {
    console.log(`📊 [RECURRENCE CALC] Processing weekdays for weekly task ${taskId}:`, {
      weekdays: task.weekdays,
      weekdaysType: typeof task.weekdays,
      isArray: Array.isArray(task.weekdays)
    });

    // Handle null/undefined weekdays
    if (task.weekdays === null || task.weekdays === undefined) {
      console.log(`📊 [RECURRENCE CALC] No weekdays specified for task ${taskId}, using legacy calculation`);
      return undefined;
    }

    try {
      // Validate weekdays
      const validationResult = WeekdayUtils.validateAndNormalizeWeekdays(task.weekdays);
      
      if (!validationResult.isValid) {
        console.warn(`⚠️ [RECURRENCE CALC] Invalid weekdays for task ${taskId}, falling back to legacy:`, {
          errors: validationResult.errors,
          originalWeekdays: task.weekdays
        });
        return undefined;
      }

      // Handle empty valid weekdays
      if (validationResult.validWeekdays.length === 0) {
        console.warn(`⚠️ [RECURRENCE CALC] No valid weekdays after processing for task ${taskId}, using legacy calculation`);
        return undefined;
      }

      console.log(`✅ [RECURRENCE CALC] Weekdays processed successfully for task ${taskId}:`, {
        originalWeekdays: task.weekdays,
        validWeekdays: validationResult.validWeekdays,
        weekdayNames: validationResult.validWeekdays.map(d => WeekdayUtils.getWeekdayName(d))
      });

      return validationResult.validWeekdays;

    } catch (weekdayError) {
      console.error(`❌ [RECURRENCE CALC] Error processing weekdays for task ${taskId}:`, {
        weekdays: task.weekdays,
        error: weekdayError
      });
      return undefined; // Fall back to legacy calculation
    }
  }

  /**
   * Create an empty result with error information for debugging
   */
  private static createEmptyResultWithError(
    taskId: string,
    errorType: string,
    errors: string[]
  ): RecurrenceCalculation {
    console.error(`💥 [RECURRENCE CALC] Creating empty result due to ${errorType}:`, {
      taskId,
      errors,
      timestamp: new Date().toISOString()
    });

    return {
      monthlyOccurrences: 0,
      monthlyHours: 0,
      taskId,
      nextDueDates: [],
      // Add error context for debugging (non-breaking addition)
      __errorContext: {
        errorType,
        errors,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Create safe task summary for error logging
   */
  private static createSafeTaskSummary(task: RecurringTaskDB): any {
    try {
      return {
        id: task?.id,
        name: task?.name,
        recurrence_type: task?.recurrence_type,
        estimated_hours: task?.estimated_hours,
        has_weekdays: task?.weekdays !== null && task?.weekdays !== undefined,
        weekdays_length: Array.isArray(task?.weekdays) ? task.weekdays.length : 'N/A'
      };
    } catch {
      return { error: 'Could not create task summary' };
    }
  }

  /**
   * Create an empty result for successful validation but failed calculations
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
