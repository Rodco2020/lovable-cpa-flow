
import { TaskTemplate } from '@/types/task';
import { TaskFormData } from './types';

/**
 * Validates the task form and returns validation errors
 * 
 * @param taskForm - Current form data
 * @param selectedTemplate - Currently selected template
 * @param isRecurring - Whether the task is recurring
 * @returns Object containing validation errors
 */
export function validateTaskForm(
  taskForm: TaskFormData,
  selectedTemplate: TaskTemplate | null,
  isRecurring: boolean
): Record<string, string> {
  const errors: Record<string, string> = {};
  
  if (!selectedTemplate) {
    errors.templateId = "Please select a task template";
  }
  
  if (!taskForm.clientId) {
    errors.clientId = "Please select a client";
  }
  
  if (!taskForm.name.trim()) {
    errors.name = "Task name is required";
  }
  
  if (taskForm.estimatedHours <= 0) {
    errors.estimatedHours = "Estimated hours must be greater than 0";
  }
  
  // Validation specific to recurring vs. ad-hoc tasks
  if (isRecurring) {
    if (!taskForm.dueDate) {
      errors.dueDate = "First due date is required";
    }
    
    if (taskForm.recurrenceType === 'Weekly' && taskForm.weekdays.length === 0) {
      errors.weekdays = "Please select at least one weekday";
    }
  } else if (!taskForm.dueDate) {
    errors.dueDate = "Due date is required";
  }
  
  return errors;
}

/**
 * Custom hook for form validation logic
 * 
 * @param taskForm - Current form data
 * @param selectedTemplate - Currently selected template
 * @param isRecurring - Whether the task is recurring
 * @param setFormErrors - Function to update form errors
 * @returns Validation function
 */
export function useFormValidation(
  taskForm: TaskFormData,
  selectedTemplate: TaskTemplate | null,
  isRecurring: boolean,
  setFormErrors: (errors: Record<string, string>) => void
) {
  /**
   * Validates the form and updates error state
   * 
   * @returns True if the form is valid, false otherwise
   */
  const validateForm = () => {
    const errors = validateTaskForm(taskForm, selectedTemplate, isRecurring);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return { validateForm };
}
