
/**
 * Data Validation Service for Demand Matrix
 * Comprehensive validation to prevent invalid array lengths and data corruption
 */

import { RecurringTaskDB } from '@/types/task';
import { DemandMatrixData } from '@/types/demand';

export class DataValidator {
  /**
   * Validate recurring tasks data before processing
   */
  static validateRecurringTasks(tasks: RecurringTaskDB[]): {
    validTasks: RecurringTaskDB[];
    invalidTasks: Array<{ task: RecurringTaskDB; errors: string[] }>;
  } {
    const validTasks: RecurringTaskDB[] = [];
    const invalidTasks: Array<{ task: RecurringTaskDB; errors: string[] }> = [];

    for (const task of tasks) {
      const errors = this.validateSingleTask(task);
      
      if (errors.length === 0) {
        validTasks.push(task);
      } else {
        invalidTasks.push({ task, errors });
        console.warn(`Invalid task detected: ${task.id}`, errors);
      }
    }

    return { validTasks, invalidTasks };
  }

  /**
   * Validate a single recurring task
   */
  private static validateSingleTask(task: RecurringTaskDB): string[] {
    const errors: string[] = [];

    // Basic field validation
    if (!task.id || typeof task.id !== 'string') {
      errors.push('Missing or invalid task ID');
    }

    if (!task.client_id || typeof task.client_id !== 'string') {
      errors.push('Missing or invalid client ID');
    }

    if (!task.template_id || typeof task.template_id !== 'string') {
      errors.push('Missing or invalid template ID');
    }

    // Estimated hours validation
    if (typeof task.estimated_hours !== 'number' || 
        task.estimated_hours < 0 || 
        task.estimated_hours > 1000 || 
        !isFinite(task.estimated_hours)) {
      errors.push(`Invalid estimated hours: ${task.estimated_hours}`);
    }

    // Required skills validation
    if (!Array.isArray(task.required_skills)) {
      errors.push('Required skills must be an array');
    } else if (task.required_skills.length > 50) {
      errors.push(`Too many required skills: ${task.required_skills.length}`);
    }

    // Recurrence type validation
    const validRecurrenceTypes = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually'];
    if (!validRecurrenceTypes.includes(task.recurrence_type)) {
      errors.push(`Invalid recurrence type: ${task.recurrence_type}`);
    }

    // Recurrence interval validation
    const interval = task.recurrence_interval;
    if (interval !== null && 
        (typeof interval !== 'number' || 
         interval < 1 || 
         interval > 100 || 
         !Number.isInteger(interval))) {
      errors.push(`Invalid recurrence interval: ${interval}`);
    }

    // Date validation
    if (task.due_date) {
      const dueDate = new Date(task.due_date);
      if (isNaN(dueDate.getTime())) {
        errors.push(`Invalid due date: ${task.due_date}`);
      }
    }

    if (task.end_date) {
      const endDate = new Date(task.end_date);
      if (isNaN(endDate.getTime())) {
        errors.push(`Invalid end date: ${task.end_date}`);
      }
    }

    // Weekdays validation for weekly recurrence
    if (task.recurrence_type === 'Weekly' && task.weekdays) {
      if (!Array.isArray(task.weekdays)) {
        errors.push('Weekdays must be an array for weekly recurrence');
      } else {
        for (const day of task.weekdays) {
          if (!Number.isInteger(day) || day < 0 || day > 6) {
            errors.push(`Invalid weekday: ${day} (must be 0-6)`);
          }
        }
      }
    }

    // Day of month validation
    if (task.day_of_month !== null) {
      if (!Number.isInteger(task.day_of_month) || 
          task.day_of_month < 1 || 
          task.day_of_month > 31) {
        errors.push(`Invalid day of month: ${task.day_of_month}`);
      }
    }

    // Month of year validation
    if (task.month_of_year !== null) {
      if (!Number.isInteger(task.month_of_year) || 
          task.month_of_year < 1 || 
          task.month_of_year > 12) {
        errors.push(`Invalid month of year: ${task.month_of_year}`);
      }
    }

    return errors;
  }

  /**
   * Validate matrix data structure
   */
  static validateMatrixData(matrixData: DemandMatrixData): string[] {
    const errors: string[] = [];

    // Check basic structure
    if (!matrixData) {
      errors.push('Matrix data is null or undefined');
      return errors;
    }

    // Validate months array
    if (!Array.isArray(matrixData.months)) {
      errors.push('Months must be an array');
    } else {
      if (matrixData.months.length === 0) {
        errors.push('Months array is empty');
      } else if (matrixData.months.length > 24) {
        errors.push(`Too many months: ${matrixData.months.length} (max: 24)`);
      }

      matrixData.months.forEach((month, index) => {
        if (!month.key || !month.label) {
          errors.push(`Invalid month at index ${index}: missing key or label`);
        }
      });
    }

    // Validate skills array
    if (!Array.isArray(matrixData.skills)) {
      errors.push('Skills must be an array');
    } else if (matrixData.skills.length > 100) {
      errors.push(`Too many skills: ${matrixData.skills.length} (max: 100)`);
    }

    // Validate data points
    if (!Array.isArray(matrixData.dataPoints)) {
      errors.push('Data points must be an array');
    } else {
      if (matrixData.dataPoints.length > 10000) {
        errors.push(`Too many data points: ${matrixData.dataPoints.length} (max: 10000)`);
      }

      matrixData.dataPoints.forEach((point, index) => {
        if (typeof point.demandHours !== 'number' || 
            !isFinite(point.demandHours) || 
            point.demandHours < 0) {
          errors.push(`Invalid demand hours at data point ${index}: ${point.demandHours}`);
        }

        if (typeof point.taskCount !== 'number' || 
            !Number.isInteger(point.taskCount) || 
            point.taskCount < 0) {
          errors.push(`Invalid task count at data point ${index}: ${point.taskCount}`);
        }

        if (typeof point.clientCount !== 'number' || 
            !Number.isInteger(point.clientCount) || 
            point.clientCount < 0) {
          errors.push(`Invalid client count at data point ${index}: ${point.clientCount}`);
        }
      });
    }

    // Validate totals
    if (typeof matrixData.totalDemand !== 'number' || 
        !isFinite(matrixData.totalDemand) || 
        matrixData.totalDemand < 0) {
      errors.push(`Invalid total demand: ${matrixData.totalDemand}`);
    }

    return errors;
  }

  /**
   * Sanitize array lengths to prevent RangeError
   */
  static sanitizeArrayLength(length: number, maxLength: number = 10000): number {
    if (typeof length !== 'number' || !isFinite(length) || length < 0) {
      console.warn(`Invalid array length: ${length}, defaulting to 0`);
      return 0;
    }

    if (length > maxLength) {
      console.warn(`Array length ${length} exceeds maximum ${maxLength}, capping to maximum`);
      return maxLength;
    }

    return Math.floor(length);
  }
}
