
import { RecurringTaskDB } from '@/types/task';
import { WeekdayUtils } from './weekdayUtils';

/**
 * Enhanced validation utilities with robust weekdays support and detailed error reporting
 */
export class ValidationUtils {
  /**
   * Validate recurring task inputs with comprehensive checks including enhanced weekdays support
   */
  static validateTaskInputs(task: RecurringTaskDB): { 
    isValid: boolean; 
    errors: string[]; 
    warnings: string[];
    context?: any;
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    console.log(`🔍 [VALIDATION] Starting comprehensive validation for task ${task?.id}:`, {
      taskName: task?.name,
      recurrenceType: task?.recurrence_type,
      weekdays: task?.weekdays,
      hasWeekdays: task?.weekdays !== null && task?.weekdays !== undefined
    });

    try {
      // Validate basic required fields
      this.validateBasicFields(task, errors);
      
      // Validate recurrence-specific fields
      this.validateRecurrenceFields(task, errors, warnings);

      // Enhanced weekdays validation for weekly tasks
      if (this.isWeeklyTask(task)) {
        this.validateWeekdaysForWeeklyTask(task, errors, warnings);
      }

      // Validate annual task specific fields
      if (this.isAnnualTask(task)) {
        this.validateAnnualTaskFields(task, errors);
      }

      const result = {
        isValid: errors.length === 0,
        errors,
        warnings,
        context: this.createValidationContext(task, errors, warnings)
      };

      console.log(`📊 [VALIDATION] Validation summary for task ${task?.id}:`, {
        isValid: result.isValid,
        errorCount: errors.length,
        warningCount: warnings.length,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined
      });

      return result;

    } catch (validationError) {
      console.error(`❌ [VALIDATION] Critical validation error for task ${task?.id}:`, validationError);
      errors.push(`Validation process failed: ${validationError}`);
      
      return {
        isValid: false,
        errors,
        warnings,
        context: WeekdayUtils.createErrorContext(task?.id || 'unknown', task?.weekdays)
      };
    }
  }

  /**
   * Enhanced weekdays validation specifically for weekly tasks
   */
  static validateWeekdaysForWeeklyTask(
    task: RecurringTaskDB,
    errors: string[],
    warnings: string[]
  ): void {
    console.log(`📅 [VALIDATION] Validating weekdays for weekly task ${task.id}:`, {
      weekdays: task.weekdays,
      weekdaysType: typeof task.weekdays,
      isArray: Array.isArray(task.weekdays)
    });

    // Allow null/undefined weekdays (will fall back to legacy calculation)
    if (task.weekdays === null || task.weekdays === undefined) {
      const warning = 'Weekly task has no weekdays specified, will use legacy calculation (4.33 occurrences/month)';
      warnings.push(warning);
      console.warn(`⚠️ [VALIDATION] ${warning}`);
      return;
    }

    try {
      const validationResult = WeekdayUtils.validateAndNormalizeWeekdays(task.weekdays);
      
      // Add errors from weekdays validation
      if (!validationResult.isValid) {
        errors.push(...validationResult.errors.map(error => `Weekdays validation failed: ${error}`));
        console.error(`❌ [VALIDATION] Weekdays validation failed for task ${task.id}:`, validationResult.errors);
      }

      // Add warnings from weekdays validation
      if (validationResult.warnings.length > 0) {
        warnings.push(...validationResult.warnings.map(warning => `Weekdays: ${warning}`));
        console.warn(`⚠️ [VALIDATION] Weekdays warnings for task ${task.id}:`, validationResult.warnings);
      }

      // Additional business logic validation
      if (validationResult.isValid && validationResult.validWeekdays.length > 0) {
        // Warn if all 7 days are selected (might be inefficient)
        if (validationResult.validWeekdays.length === 7) {
          warnings.push('All 7 weekdays selected - consider using daily recurrence instead');
        }

        // Log successful validation
        console.log(`✅ [VALIDATION] Weekdays validated successfully for task ${task.id}:`, {
          validWeekdays: validationResult.validWeekdays,
          weekdayNames: validationResult.validWeekdays.map(d => WeekdayUtils.getWeekdayName(d)),
          description: WeekdayUtils.getWeekdaysDescription(validationResult.validWeekdays)
        });
      }

    } catch (weekdayError) {
      const errorMessage = `Failed to validate weekdays: ${weekdayError}`;
      errors.push(errorMessage);
      console.error(`❌ [VALIDATION] ${errorMessage}`, {
        taskId: task.id,
        weekdays: task.weekdays,
        error: weekdayError
      });
    }
  }

  /**
   * Validate basic required fields
   */
  private static validateBasicFields(task: RecurringTaskDB, errors: string[]): void {
    if (!task || !task.id) {
      errors.push('Task ID is missing or invalid');
    }

    if (!task.client_id || typeof task.client_id !== 'string') {
      errors.push('Client ID is missing or invalid');
    }

    if (typeof task.estimated_hours !== 'number' || task.estimated_hours <= 0) {
      errors.push(`Invalid estimated_hours: ${task.estimated_hours} (must be a positive number)`);
    }

    if (!task.recurrence_type || typeof task.recurrence_type !== 'string') {
      errors.push('Recurrence type is missing or invalid');
    }

    if (task.is_active !== true) {
      errors.push('Task is not active');
    }
  }

  /**
   * Validate recurrence-specific fields
   */
  private static validateRecurrenceFields(
    task: RecurringTaskDB,
    errors: string[],
    warnings: string[]
  ): void {
    if (task.recurrence_interval !== null && task.recurrence_interval !== undefined) {
      if (typeof task.recurrence_interval !== 'number' || task.recurrence_interval <= 0) {
        errors.push(`Invalid recurrence_interval: ${task.recurrence_interval} (must be a positive number)`);
      }
    }

    // Validate recurrence type
    const validRecurrenceTypes = ['daily', 'weekly', 'monthly', 'quarterly', 'annually', 'annual'];
    const recurrenceType = task.recurrence_type?.toLowerCase();
    
    if (recurrenceType && !validRecurrenceTypes.includes(recurrenceType)) {
      warnings.push(`Unusual recurrence type: ${task.recurrence_type}. Supported types: ${validRecurrenceTypes.join(', ')}`);
    }
  }

  /**
   * Validate annual task specific fields
   */
  private static validateAnnualTaskFields(task: RecurringTaskDB, errors: string[]): void {
    console.log(`📅 [VALIDATION] Validating annual task fields for ${task.id}:`, {
      monthOfYear: task.month_of_year,
      dayOfMonth: task.day_of_month,
      dueDate: task.due_date
    });

    if (!task.month_of_year && !task.due_date) {
      errors.push('Annual task must have either month_of_year or due_date specified');
    }

    if (task.month_of_year !== null && task.month_of_year !== undefined) {
      if (typeof task.month_of_year !== 'number' || task.month_of_year < 1 || task.month_of_year > 12) {
        errors.push(`Invalid month_of_year: ${task.month_of_year} (must be 1-12)`);
      }
    }

    if (task.day_of_month !== null && task.day_of_month !== undefined) {
      if (typeof task.day_of_month !== 'number' || task.day_of_month < 1 || task.day_of_month > 31) {
        errors.push(`Invalid day_of_month: ${task.day_of_month} (must be 1-31)`);
      }
    }
  }

  /**
   * Check if task is weekly
   */
  private static isWeeklyTask(task: RecurringTaskDB): boolean {
    return task.recurrence_type?.toLowerCase() === 'weekly';
  }

  /**
   * Check if task is annual
   */
  private static isAnnualTask(task: RecurringTaskDB): boolean {
    return task.recurrence_type?.toLowerCase().includes('annual');
  }

  /**
   * Create validation context for debugging
   */
  private static createValidationContext(
    task: RecurringTaskDB,
    errors: string[],
    warnings: string[]
  ): any {
    const context = {
      taskId: task?.id,
      taskName: task?.name,
      recurrenceType: task?.recurrence_type,
      hasWeekdays: task?.weekdays !== null && task?.weekdays !== undefined,
      validationSummary: {
        passed: errors.length === 0,
        errorCount: errors.length,
        warningCount: warnings.length
      }
    };

    // Add weekdays context for weekly tasks
    if (this.isWeeklyTask(task)) {
      return {
        ...context,
        weekdaysContext: WeekdayUtils.createErrorContext(task.id, task.weekdays)
      };
    }

    return context;
  }

  /**
   * Legacy method for backward compatibility - now uses enhanced validation
   */
  static validateWeekdaysArray(weekdays: any): { 
    isValid: boolean; 
    errors: string[]; 
    validWeekdays?: number[] 
  } {
    console.log(`🔄 [VALIDATION] Legacy validateWeekdaysArray called, forwarding to enhanced validation`);
    
    const result = WeekdayUtils.validateAndNormalizeWeekdays(weekdays);
    
    return {
      isValid: result.isValid,
      errors: result.errors,
      validWeekdays: result.validWeekdays
    };
  }
}
