
import { TaskTemplate } from '@/types/task';
import { useTaskTemplateFormState } from './formState';
import { useSkillOperations } from './skillOperations';
import { prepareFormDataForSubmission } from './dataPreparation';
import { UseTaskTemplateFormReturn } from './types';

/**
 * Custom hook for managing task template form state and operations
 * Provides form data handling, input changes, and skill management
 * 
 * This hook encapsulates all form logic for creating and editing task templates,
 * including state management, skill operations, and data preparation.
 */
export function useTaskTemplateForm(initialTemplate: TaskTemplate | null = null): UseTaskTemplateFormReturn {
  // State management
  const {
    formData,
    setFormData,
    resetForm,
    updateField,
  } = useTaskTemplateFormState(initialTemplate);

  // Skill operations
  const {
    handleSkillChange,
    isSkillSelected,
    getUnmatchedSkills,
    cleanupSkills,
  } = useSkillOperations(formData, setFormData);

  // Prepare form data for submission wrapper
  const prepareFormDataForSubmissionHandler = () => prepareFormDataForSubmission(formData);

  return {
    formData,
    resetForm,
    updateField,
    handleSkillChange,
    isSkillSelected,
    getUnmatchedSkills,
    cleanupSkills,
    prepareFormDataForSubmission: prepareFormDataForSubmissionHandler,
  };
}

// Re-export types for consumers
export type { UseTaskTemplateFormReturn } from './types';
