
import { RecurringTaskDB } from '@/types/task';

/**
 * Validation utilities for recurring task inputs
 */
export class ValidationUtils {
  /**
   * Validate recurring task inputs with comprehensive checks
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
