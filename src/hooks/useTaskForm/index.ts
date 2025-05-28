
import { useTaskFormState } from './formState';
import { useFormValidation } from './formValidation';
import { useFormHandlers } from './formHandlers';
import { buildRecurrencePattern } from './recurrenceBuilder';
import { TaskFormHookReturn } from './types';

/**
 * Custom hook for managing task form state and logic
 * 
 * This hook encapsulates form state, validation, and transformations for both
 * ad-hoc and recurring task creation flows. It handles template selection,
 * input changes, and building recurrence patterns.
 * 
 * @returns Object containing form state and handler functions
 */
export default function useTaskForm(): TaskFormHookReturn {
  // State management
  const {
    taskForm,
    setTaskForm,
    selectedTemplate,
    setSelectedTemplate,
    isRecurring,
    setIsRecurring,
    formErrors,
    setFormErrors,
    resetForm
  } = useTaskFormState();

  // Validation logic
  const { validateForm } = useFormValidation(
    taskForm,
    selectedTemplate,
    isRecurring,
    setFormErrors
  );

  // Form handlers
  const {
    handleInputChange,
    handleTemplateSelect,
    handleClientChange,
    handleWeekdayChange
  } = useFormHandlers(
    taskForm,
    setTaskForm,
    formErrors,
    setFormErrors,
    setSelectedTemplate
  );

  // Recurrence pattern builder
  const buildRecurrencePatternHandler = () => buildRecurrencePattern(taskForm);

  return {
    taskForm,
    selectedTemplate,
    formErrors,
    isRecurring,
    setIsRecurring,
    handleInputChange,
    handleTemplateSelect,
    handleClientChange,
    handleWeekdayChange,
    validateForm,
    resetForm,
    setFormErrors,
    buildRecurrencePattern: buildRecurrencePatternHandler
  };
}

// Re-export types for consumers
export type { TaskFormData, TaskFormHookReturn } from './types';
