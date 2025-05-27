
import { useState } from 'react';
import { TaskTemplate, TaskPriority, TaskCategory } from '@/types/task';

/**
 * Custom hook for managing task template form state and operations
 * Provides form data handling, input changes, and skill management
 */
export function useTaskTemplateForm(initialTemplate: TaskTemplate | null = null) {
  // Form state for new/edited template
  const [formData, setFormData] = useState<Partial<TaskTemplate>>(
    initialTemplate ? normalizeTemplateData(initialTemplate) : {
      name: '',
      description: '',
      defaultEstimatedHours: 1,
      requiredSkills: [],
      defaultPriority: 'Medium',
      category: 'Other',
    }
  );

  // Function to normalize template data when initializing
  function normalizeTemplateData(template: TaskTemplate): Partial<TaskTemplate> {
    // Important: Ensure the requiredSkills array is properly normalized
    // Convert each skill ID to string format to ensure consistent comparison
    const normalizedSkills = Array.isArray(template.requiredSkills) 
      ? template.requiredSkills.map(skillId => skillId.toString())
      : [];
    
    console.log('Normalizing template data, skills before:', template.requiredSkills);
    console.log('Normalized skills:', normalizedSkills);
    
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
  const resetForm = (template: TaskTemplate | null = null) => {
    if (template) {
      setFormData(normalizeTemplateData(template));
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
      console.log(`Adding skill ${normalizedSkillId}`, updatedSkills);
    } else {
      // Remove skill
      updatedSkills = currentSkills.filter(s => s.toString() !== normalizedSkillId);
      console.log(`Removing skill ${normalizedSkillId}`, updatedSkills);
    }
    
    // Update form data with new skills array
    setFormData(prev => ({
      ...prev,
      requiredSkills: updatedSkills
    }));
  };

  // Helper function to check if a skill is selected
  // This function now handles both exact matches and flexible matching
  const isSkillSelected = (skillId: string): boolean => {
    if (!formData.requiredSkills) return false;
    
    // Convert both to strings for comparison
    const normalizedSkillId = skillId.toString();
    const isSelected = formData.requiredSkills.some(
      selectedId => selectedId.toString() === normalizedSkillId
    );
    
    console.log(`Checking if skill ${normalizedSkillId} is selected:`, isSelected);
    console.log('Current form skills:', formData.requiredSkills);
    return isSelected;
  };

  // Get all skills that are stored but don't match available skills
  // This helps identify legacy or custom skills that need special handling
  const getUnmatchedSkills = (availableSkills: Array<{id: string, name: string}>) => {
    if (!formData.requiredSkills) return [];
    
    const availableSkillIds = availableSkills.map(skill => skill.id.toString());
    const unmatchedSkills = formData.requiredSkills.filter(
      skillId => !availableSkillIds.includes(skillId.toString())
    );
    
    console.log('Unmatched skills found:', unmatchedSkills);
    return unmatchedSkills;
  };

  // Clean up skills to remove any that don't exist in the available skills
  const cleanupSkills = (availableSkills: Array<{id: string, name: string}>) => {
    if (!formData.requiredSkills) return;
    
    const availableSkillIds = availableSkills.map(skill => skill.id.toString());
    const validSkills = formData.requiredSkills.filter(
      skillId => availableSkillIds.includes(skillId.toString())
    );
    
    if (validSkills.length !== formData.requiredSkills.length) {
      console.log('Cleaning up skills. Before:', formData.requiredSkills, 'After:', validSkills);
      setFormData(prev => ({
        ...prev,
        requiredSkills: validSkills
      }));
    }
  };

  // Prepare form data for submission
  // This ensures the data is in the correct format before sending to the API
  const prepareFormDataForSubmission = () => {
    // Ensure we're sending the requiredSkills as an array of strings
    const preparedData = {
      ...formData,
      requiredSkills: formData.requiredSkills || []
    };
    
    console.log('Prepared form data for submission:', preparedData);
    return preparedData;
  };

  return {
    formData,
    resetForm,
    updateField,
    handleSkillChange,
    isSkillSelected,
    getUnmatchedSkills,
    cleanupSkills,
    prepareFormDataForSubmission,
  };
}
