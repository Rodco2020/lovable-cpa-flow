
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
  const resetForm = (template: TaskTemplate | null = null) => {
    console.log('Resetting form with template:', template?.name || 'new template');
    if (template) {
      const normalizedData = normalizeTemplateData(template);
      console.log('Setting form data to:', normalizedData);
      setFormData(normalizedData);
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
    console.log('Updating field:', key, 'with value:', value);
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Handle skill selection/deselection
  const handleSkillChange = (skillId: string, checked: boolean) => {
    // Ensure skillId is a string and normalize it
    const normalizedSkillId = String(skillId).trim();
    
    // Get current skills (or empty array if undefined)
    const currentSkills = formData.requiredSkills || [];
    
    console.log('Skill change requested:', {
      skillId: normalizedSkillId,
      checked,
      currentSkills
    });
    
    let updatedSkills: string[];
    if (checked) {
      // Add skill only if it doesn't already exist
      if (!currentSkills.some(s => String(s).trim() === normalizedSkillId)) {
        updatedSkills = [...currentSkills, normalizedSkillId];
        console.log('Adding skill:', normalizedSkillId, '-> updated skills:', updatedSkills);
      } else {
        updatedSkills = [...currentSkills];
        console.log('Skill already exists, no change needed');
      }
    } else {
      // Remove skill
      updatedSkills = currentSkills.filter(s => String(s).trim() !== normalizedSkillId);
      console.log('Removing skill:', normalizedSkillId, '-> updated skills:', updatedSkills);
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
    if (!formData.requiredSkills) {
      console.log('No required skills in form data');
      return false;
    }
    
    // Convert skill ID to string for comparison
    const normalizedSkillId = String(skillId).trim();
    
    // Check if the skill is in the current selection
    const isSelected = formData.requiredSkills.some(
      selectedId => String(selectedId).trim() === normalizedSkillId
    );
    
    console.log('Checking skill selection:', {
      skillId: normalizedSkillId,
      currentSkills: formData.requiredSkills,
      isSelected
    });
    
    return isSelected;
  };

  // Get all skills that are stored but don't match available skills
  // This helps identify legacy or custom skills that need special handling
  const getUnmatchedSkills = (availableSkills: Array<{id: string, name: string}>) => {
    if (!formData.requiredSkills) return [];
    
    const availableSkillIds = availableSkills.map(skill => String(skill.id).trim());
    const unmatchedSkills = formData.requiredSkills.filter(
      skillId => !availableSkillIds.includes(String(skillId).trim())
    );
    
    console.log('Unmatched skills analysis:', {
      availableSkillIds,
      formSkills: formData.requiredSkills,
      unmatchedSkills
    });
    
    return unmatchedSkills;
  };

  // Clean up skills to remove any that don't exist in the available skills
  const cleanupSkills = (availableSkills: Array<{id: string, name: string}>) => {
    if (!formData.requiredSkills) return;
    
    const availableSkillIds = availableSkills.map(skill => String(skill.id).trim());
    const validSkills = formData.requiredSkills.filter(
      skillId => availableSkillIds.includes(String(skillId).trim())
    );
    
    if (validSkills.length !== formData.requiredSkills.length) {
      console.log('Cleaning up skills:', {
        before: formData.requiredSkills,
        after: validSkills,
        removed: formData.requiredSkills.filter(s => !validSkills.includes(s))
      });
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
    
    console.log('Preparing form data for submission:', preparedData);
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
