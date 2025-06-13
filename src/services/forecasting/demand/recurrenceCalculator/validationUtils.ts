
import { RecurringTaskDB } from '@/types/task';

/**
 * Validation utilities for recurring task inputs with enhanced weekdays support
 */
export class ValidationUtils {
  /**
   * Validate recurring task inputs with comprehensive checks including weekdays
   */
  static validateTaskInputs(task: RecurringTaskDB): { isValid: boolean; errors: string[] } {
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

    // Weekly task specific validation
    if (task.recurrence_type && task.recurrence_type.toLowerCase() === 'weekly') {
      this.validateWeeklyTaskFields(task, errors);
    }

    // Annual task specific validation
    if (task.recurrence_type && task.recurrence_type.toLowerCase().includes('annual')) {
      this.validateAnnualTaskFields(task, errors);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate weekly task specific fields including weekdays
   */
  private static validateWeeklyTaskFields(task: RecurringTaskDB, errors: string[]): void {
    if (task.weekdays !== null && task.weekdays !== undefined) {
      const weekdaysValidation = this.validateWeekdaysArray(task.weekdays);
      if (!weekdaysValidation.isValid) {
        errors.push(...weekdaysValidation.errors);
      }
    }
  }

  /**
   * Validate weekdays array with detailed error reporting
   */
  static validateWeekdaysArray(weekdays: any): { 
    isValid: boolean; 
    errors: string[]; 
    validWeekdays?: number[] 
  } {
    const errors: string[] = [];

    // Check if weekdays is an array
    if (!Array.isArray(weekdays)) {
      errors.push(`Weekdays must be an array, got: ${typeof weekdays}`);
      return { isValid: false, errors };
    }

    // Check if array is empty
    if (weekdays.length === 0) {
      // Empty array is valid - will fall back to legacy calculation
      return { 
        isValid: true, 
        errors: [], 
        validWeekdays: [] 
      };
    }

    // Validate each weekday value
    const validWeekdays: number[] = [];
    const invalidWeekdays: any[] = [];

    weekdays.forEach((day, index) => {
      if (!Number.isInteger(day) || day < 0 || day > 6) {
        invalidWeekdays.push({ value: day, index });
      } else {
        validWeekdays.push(day);
      }
    });

    // Report invalid weekdays
    if (invalidWeekdays.length > 0) {
      errors.push(`Invalid weekday values found: ${invalidWeekdays.map(item => 
        `${item.value} at index ${item.index}`
      ).join(', ')} (weekdays must be integers 0-6)`);
    }

    // Remove duplicates from valid weekdays
    const uniqueValidWeekdays = [...new Set(validWeekdays)].sort();

    // If all weekdays were invalid, return error
    if (uniqueValidWeekdays.length === 0 && weekdays.length > 0) {
      errors.push('No valid weekdays found (all values were invalid)');
      return { isValid: false, errors };
    }

    // Log validation results
    console.log(`📋 [WEEKDAYS VALIDATION] Validation complete:`, {
      originalWeekdays: weekdays,
      validWeekdays: uniqueValidWeekdays,
      invalidCount: invalidWeekdays.length,
      duplicatesRemoved: validWeekdays.length !== uniqueValidWeekdays.length,
      isValid: errors.length === 0
    });

    return {
      isValid: errors.length === 0,
      errors,
      validWeekdays: uniqueValidWeekdays
    };
  }

  /**
   * Validate annual task specific fields
   */
  private static validateAnnualTaskFields(task: RecurringTaskDB, errors: string[]): void {
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
}
