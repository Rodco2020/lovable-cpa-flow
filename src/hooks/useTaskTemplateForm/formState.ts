
import { useState, useCallback } from 'react';
import { TaskTemplate } from '@/types/task';

interface FormState {
  name: string;
  description: string;
  defaultEstimatedHours: number;
  requiredSkills: string[];
  defaultPriority: TaskTemplate['defaultPriority'];
  category: TaskTemplate['category'];
}

const initialFormState: FormState = {
  name: '',
  description: '',
  defaultEstimatedHours: 1,
  requiredSkills: [],
  defaultPriority: 'Medium',
  category: 'Other'
};

export function useTaskTemplateFormState(initialTemplate: TaskTemplate | null = null) {
  const [formData, setFormData] = useState<FormState>(() => {
    if (initialTemplate) {
      return {
        name: initialTemplate.name,
        description: initialTemplate.description,
        defaultEstimatedHours: initialTemplate.defaultEstimatedHours,
        requiredSkills: initialTemplate.requiredSkills || [],
        defaultPriority: initialTemplate.defaultPriority,
        category: initialTemplate.category
      };
    }
    return initialFormState;
  });

  const updateField = useCallback((key: string, value: any) => {
    console.log('FormState: Updating field:', key, 'to:', value);
    setFormData(prev => {
      const updated = { ...prev, [key]: value };
      console.log('FormState: Updated form data:', updated);
      return updated;
    });
  }, []);

  const resetForm = useCallback((template?: TaskTemplate | null) => {
    console.log('FormState: Resetting form with template:', template?.name || 'new template');
    if (template) {
      setFormData({
        name: template.name,
        description: template.description,
        defaultEstimatedHours: template.defaultEstimatedHours,
        requiredSkills: template.requiredSkills || [],
        defaultPriority: template.defaultPriority,
        category: template.category
      });
    } else {
      setFormData(initialFormState);
    }
  }, []);

  return {
    formData,
    setFormData,
    updateField,
    resetForm
  };
}
