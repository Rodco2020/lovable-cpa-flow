
import { useState, useCallback } from 'react';
import { TaskTemplate } from '@/types/task';

/**
 * Custom hook for managing task template form state
 * Provides state management for form data and basic field updates
 */
export function useTaskTemplateFormState(initialTemplate: TaskTemplate | null = null) {
  // Form state for new/edited template
  const [formData, setFormData] = useState<Partial<TaskTemplate>>(() => {
    const initial = initialTemplate ? normalizeTemplateData(initialTemplate) : {
      name: '',
      description: '',
      defaultEstimatedHours: 1,
      requiredSkills: [],
      defaultPriority: 'Medium' as const,
      category: 'Other' as const,
    };
    
    console.log('useTaskTemplateFormState: Initial state:', initial);
    return initial;
  });

  // Function to normalize template data when initializing
  function normalizeTemplateData(template: TaskTemplate): Partial<TaskTemplate> {
    // Important: Ensure the requiredSkills array is properly normalized
    // Convert each skill ID to string format to ensure consistent comparison
    const normalizedSkills = Array.isArray(template.requiredSkills) 
      ? template.requiredSkills.map(skillId => {
          // Handle both string and number skill IDs by converting to string
          const normalizedId = String(skillId).trim();
          console.log('Normalizing skill ID:', skillId, '-> normalized:', normalizedId);
          return normalizedId;
        })
      : [];
    
    console.log('Normalizing template data:');
    console.log('- Template name:', template.name);
    console.log('- Original skills:', template.requiredSkills);
    console.log('- Normalized skills:', normalizedSkills);
    
    return {
      name: template.name,
      description: template.description,
      defaultEstimatedHours: template.defaultEstimatedHours,
      requiredSkills: normalizedSkills,
      defaultPriority: template.defaultPriority,
      category: template.category,
    };
  }

  // Reset form data to initial values or use provided template
  const resetForm = useCallback((template: TaskTemplate | null = null) => {
    console.log('useTaskTemplateFormState: Resetting form with template:', template?.name || 'new template');
    if (template) {
      const normalizedData = normalizeTemplateData(template);
      console.log('useTaskTemplateFormState: Setting form data to:', normalizedData);
      setFormData(normalizedData);
    } else {
      const newFormData = {
        name: '',
        description: '',
        defaultEstimatedHours: 1,
        requiredSkills: [],
        defaultPriority: 'Medium' as const,
        category: 'Other' as const,
      };
      console.log('useTaskTemplateFormState: Setting form data to new template defaults:', newFormData);
      setFormData(newFormData);
    }
  }, []);

  // Update a single form field with debugging
  const updateField = useCallback((key: string, value: any) => {
    console.log('useTaskTemplateFormState: Updating field:', key, 'with value:', value);
    setFormData(prev => {
      const updated = { ...prev, [key]: value };
      console.log('useTaskTemplateFormState: Updated form data:', updated);
      return updated;
    });
  }, []);

  // Enhanced setFormData wrapper with debugging
  const setFormDataWrapper = useCallback((updater: (prev: Partial<TaskTemplate>) => Partial<TaskTemplate>) => {
    setFormData(prev => {
      const updated = updater(prev);
      console.log('useTaskTemplateFormState: Form data updated via setter:', {
        previous: prev,
        updated: updated
      });
      return updated;
    });
  }, []);

  return {
    formData,
    setFormData: setFormDataWrapper,
    resetForm,
    updateField,
  };
}
