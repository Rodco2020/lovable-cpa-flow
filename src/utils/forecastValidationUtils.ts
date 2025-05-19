
import { validateForecastSystem } from '@/services/forecastingService';
import { estimateRecurringTaskInstances } from '@/services/forecasting/demand';
import { RecurringTask } from '@/types/task';

/**
 * Utility function to validate task recurrence patterns
 * @param task - The task to validate
 * @returns Array of validation messages (empty if valid)
 */
export const validateTaskRecurrence = (task: RecurringTask): string[] => {
  const issues: string[] = [];
  const pattern = task.recurrencePattern;
  
  if (!pattern) {
    issues.push(`Task ${task.id}: Missing recurrence pattern`);
    return issues;
  }
  
  // Validate pattern type
  if (!pattern.type || !['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually', 'Custom'].includes(pattern.type)) {
    issues.push(`Task ${task.id}: Invalid recurrence type "${pattern.type}"`);
  }
  
  // Validate interval (should be positive integer)
  if (pattern.interval !== undefined) {
    if (!Number.isInteger(pattern.interval) || pattern.interval < 1) {
      issues.push(`Task ${task.id}: Invalid interval (${pattern.interval}), must be positive integer`);
    }
  }
  
  // Validate weekdays for weekly recurrence
  if (pattern.type === 'Weekly' && pattern.weekdays) {
    if (!Array.isArray(pattern.weekdays) || pattern.weekdays.length === 0) {
      issues.push(`Task ${task.id}: Weekly recurrence missing weekdays`);
    } else {
      // Weekdays should be 0-6 (0=Sunday, 6=Saturday)
      for (const day of pattern.weekdays) {
        if (!Number.isInteger(day) || day < 0 || day > 6) {
          issues.push(`Task ${task.id}: Invalid weekday ${day}, must be 0-6`);
        }
      }
    }
  }
  
  // Validate day of month for monthly recurrence
  if (pattern.type === 'Monthly' && pattern.dayOfMonth) {
    if (!Number.isInteger(pattern.dayOfMonth) || pattern.dayOfMonth < 1 || pattern.dayOfMonth > 31) {
      issues.push(`Task ${task.id}: Invalid day of month ${pattern.dayOfMonth}, must be 1-31`);
    }
  }
  
  // Validate custom offset for custom recurrence
  if (pattern.type === 'Custom' && pattern.customOffsetDays) {
    if (!Number.isInteger(pattern.customOffsetDays) || pattern.customOffsetDays < 1) {
      issues.push(`Task ${task.id}: Invalid custom offset ${pattern.customOffsetDays}, must be positive integer`);
    }
  }
  
  // Check for end date before start date
  if (pattern.endDate && pattern.endDate < task.createdAt) {
    issues.push(`Task ${task.id}: End date (${pattern.endDate.toISOString()}) is before task creation date (${task.createdAt.toISOString()})`);
  }
  
  return issues;
};

/**
 * Run the full forecast system validation
 * This is a convenience wrapper around the service function
 */
export const runSystemValidation = async (): Promise<string[]> => {
  return await validateForecastSystem();
};

/**
 * Estimate task recurrence with additional validation
 * Catches and reports any errors that would otherwise crash the application
 */
export const safeEstimateRecurringTaskInstances = (
  task: RecurringTask,
  startDate: Date,
  endDate: Date
): { count: number; errors: string[] } => {
  const errors: string[] = [];
  let count = 0;
  
  try {
    // Validate inputs
    if (!task) {
      errors.push('Task is undefined');
      return { count, errors };
    }
    
    if (!startDate || !endDate) {
      errors.push('Start or end date is undefined');
      return { count, errors };
    }
    
    if (endDate < startDate) {
      errors.push('End date is before start date');
      return { count, errors };
    }
    
    // Attempt to estimate instances
    count = estimateRecurringTaskInstances(task, { startDate, endDate });
    
    // Check for unreasonable values
    if (count > 100) {
      errors.push(`Warning: Unusually high instance count (${count})`);
    }
  } catch (error) {
    errors.push(`Error estimating instances: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return { count, errors };
};
