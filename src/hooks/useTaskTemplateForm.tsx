
import { useState } from 'react';
import { TaskTemplate, TaskPriority, TaskCategory } from '@/types/task';

/**
 * Custom hook for managing task template form state and operations
 * Provides form data handling, input changes, and skill management
 */
export function useTaskTemplateForm(initialTemplate: TaskTemplate | null = null) {
  // Form state for new/edited template
  const [formData, setFormData] = useState<Partial<TaskTemplate>>(
    initialTemplate || {
      name: '',
      description: '',
      defaultEstimatedHours: 1,
      requiredSkills: [],
      defaultPriority: 'Medium',
      category: 'Other',
    }
  );

  // Reset form data to initial values or use provided template
  const resetForm = (template: TaskTemplate | null = null) => {
    if (template) {
      // Important: Store the normalized skill IDs as strings
      const normalizedSkills = template.requiredSkills.map(skillId => skillId.toString());
      
      setFormData({
        name: template.name,
        description: template.description,
        defaultEstimatedHours: template.defaultEstimatedHours,
        requiredSkills: normalizedSkills,
        defaultPriority: template.defaultPriority,
        category: template.category,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        defaultEstimatedHours: 1,
        requiredSkills: [],
        defaultPriority: 'Medium',
        category: 'Other',
      });
    }
  };

  // Update a single form field
  const updateField = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Handle skill selection/deselection
  const handleSkillChange = (skillId: string, checked: boolean) => {
    // Ensure skillId is a string
    const normalizedSkillId = skillId.toString();
    
    // Create a new array to ensure React detects the state change
    // Get current skills (or empty array if undefined)
    const currentSkills = formData.requiredSkills || [];
    
    let updatedSkills: string[];
    if (checked) {
      // Add skill only if it doesn't already exist
      updatedSkills = [...currentSkills];
      if (!updatedSkills.includes(normalizedSkillId)) {
        updatedSkills.push(normalizedSkillId);
      }
    } else {
      // Remove skill
      updatedSkills = currentSkills.filter(s => s.toString() !== normalizedSkillId);
    }
    
    // Update form data with new skills array
    setFormData({
      ...formData,
      requiredSkills: updatedSkills
    });
  };

  // Helper function to check if a skill is selected
  const isSkillSelected = (skillId: string): boolean => {
    if (!formData.requiredSkills) return false;
    
    // Convert both to strings for comparison
    const normalizedSkillId = skillId.toString();
    return formData.requiredSkills.some(selectedId => selectedId.toString() === normalizedSkillId);
  };

  return {
    formData,
    resetForm,
    updateField,
    handleSkillChange,
    isSkillSelected,
  };
}
