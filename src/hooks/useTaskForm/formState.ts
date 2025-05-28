
import { useState } from 'react';
import { TaskPriority, TaskCategory, TaskTemplate, RecurrencePattern, SkillType } from '@/types/task';
import { TaskFormData } from './types';

/**
 * Initial form data structure
 */
const getInitialFormData = (): TaskFormData => ({
  name: '',
  description: '',
  clientId: '',
  estimatedHours: 1,
  priority: 'Medium' as TaskPriority,
  category: 'Other' as TaskCategory,
  requiredSkills: [] as SkillType[],
  dueDate: '',
  recurrenceType: 'Monthly' as RecurrencePattern['type'],
  interval: 1,
  weekdays: [],
  dayOfMonth: 15,
  monthOfYear: 1,
  endDate: '',
  customOffsetDays: 0
});

/**
 * Custom hook for managing task form state
 * 
 * Provides state management for form data, template selection,
 * recurring task mode, and form validation errors.
 */
export function useTaskFormState() {
  const [taskForm, setTaskForm] = useState<TaskFormData>(getInitialFormData());
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  /**
   * Resets all form state to initial values
   */
  const resetForm = () => {
    setSelectedTemplate(null);
    setIsRecurring(false);
    setFormErrors({});
    setTaskForm(getInitialFormData());
  };

  return {
    taskForm,
    setTaskForm,
    selectedTemplate,
    setSelectedTemplate,
    isRecurring,
    setIsRecurring,
    formErrors,
    setFormErrors,
    resetForm
  };
}
