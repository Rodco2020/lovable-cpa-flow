
import { RecurrencePattern } from '@/types/task';
import { TaskFormData } from './types';

/**
 * Builds a recurrence pattern object based on form values
 * 
 * @param taskForm - Current form data
 * @returns The constructed recurrence pattern
 */
export function buildRecurrencePattern(taskForm: TaskFormData): RecurrencePattern {
  const pattern: RecurrencePattern = {
    type: taskForm.recurrenceType,
    interval: taskForm.interval
  };
  
  // Add type-specific fields
  if (taskForm.recurrenceType === 'Weekly') {
    pattern.weekdays = taskForm.weekdays;
  } else if (taskForm.recurrenceType === 'Monthly') {
    pattern.dayOfMonth = taskForm.dayOfMonth;
  } else if (taskForm.recurrenceType === 'Annually') {
    pattern.dayOfMonth = taskForm.dayOfMonth;
    pattern.monthOfYear = taskForm.monthOfYear;
  } else if (taskForm.recurrenceType === 'Custom') {
    pattern.customOffsetDays = taskForm.customOffsetDays;
  }
  
  // Add end date if provided
  if (taskForm.endDate) {
    pattern.endDate = new Date(taskForm.endDate);
  }
  
  return pattern;
}
