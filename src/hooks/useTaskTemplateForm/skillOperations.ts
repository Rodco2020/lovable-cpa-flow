
import { TaskTemplate } from '@/types/task';
import { useCallback } from 'react';

/**
 * Custom hook for managing skill-related operations in task template forms
 * Handles skill selection, validation, and cleanup logic
 */
export function useSkillOperations(
  formData: Partial<TaskTemplate>,
  setFormData: (updater: (prev: Partial<TaskTemplate>) => Partial<TaskTemplate>) => void
) {
  // Handle skill selection/deselection with enhanced debugging
  const handleSkillChange = useCallback((skillId: string, checked: boolean) => {
    // Ensure skillId is a string and normalize it
    const normalizedSkillId = String(skillId).trim();
    
    // Get current skills (or empty array if undefined)
    const currentSkills = formData.requiredSkills || [];
    
    console.log('skillOperations: Skill change requested:', {
      skillId: normalizedSkillId,
      checked,
      currentSkills,
      formDataSnapshot: { ...formData }
    });
    
    let updatedSkills: string[];
    if (checked) {
      // Add skill only if it doesn't already exist
      if (!currentSkills.some(s => String(s).trim() === normalizedSkillId)) {
        updatedSkills = [...currentSkills, normalizedSkillId];
        console.log('skillOperations: Adding skill:', normalizedSkillId, '-> updated skills:', updatedSkills);
      } else {
        updatedSkills = [...currentSkills];
        console.log('skillOperations: Skill already exists, no change needed');
      }
    } else {
      // Remove skill
      updatedSkills = currentSkills.filter(s => String(s).trim() !== normalizedSkillId);
      console.log('skillOperations: Removing skill:', normalizedSkillId, '-> updated skills:', updatedSkills);
    }
    
    // Update form data with new skills array
    setFormData(prev => {
      const updated = {
        ...prev,
        requiredSkills: updatedSkills
      };
      console.log('skillOperations: Form data updated:', {
        previous: prev,
        updated: updated
      });
      return updated;
    });
  }, [formData, setFormData]);

  // Helper function to check if a skill is selected with enhanced debugging
  const isSkillSelected = useCallback((skillId: string): boolean => {
    if (!formData.requiredSkills) {
      console.log('skillOperations: No required skills in form data');
      return false;
    }
    
    // Convert skill ID to string for comparison
    const normalizedSkillId = String(skillId).trim();
    
    // Check if the skill is in the current selection
    const isSelected = formData.requiredSkills.some(
      selectedId => String(selectedId).trim() === normalizedSkillId
    );
    
    console.log('skillOperations: Checking skill selection:', {
      skillId: normalizedSkillId,
      currentSkills: formData.requiredSkills,
      isSelected
    });
    
    return isSelected;
  }, [formData.requiredSkills]);

  // Get all skills that are stored but don't match available skills
  const getUnmatchedSkills = useCallback((availableSkills: Array<{id: string, name: string}>) => {
    if (!formData.requiredSkills) return [];
    
    const availableSkillIds = availableSkills.map(skill => String(skill.id).trim());
    const unmatchedSkills = formData.requiredSkills.filter(
      skillId => !availableSkillIds.includes(String(skillId).trim())
    );
    
    console.log('skillOperations: Unmatched skills analysis:', {
      availableSkillIds,
      formSkills: formData.requiredSkills,
      unmatchedSkills
    });
    
    return unmatchedSkills;
  }, [formData.requiredSkills]);

  // Clean up skills to remove any that don't exist in the available skills
  const cleanupSkills = useCallback((availableSkills: Array<{id: string, name: string}>) => {
    if (!formData.requiredSkills) return;
    
    const availableSkillIds = availableSkills.map(skill => String(skill.id).trim());
    const validSkills = formData.requiredSkills.filter(
      skillId => availableSkillIds.includes(String(skillId).trim())
    );
    
    if (validSkills.length !== formData.requiredSkills.length) {
      console.log('skillOperations: Cleaning up skills:', {
        before: formData.requiredSkills,
        after: validSkills,
        removed: formData.requiredSkills.filter(s => !validSkills.includes(s))
      });
      setFormData(prev => ({
        ...prev,
        requiredSkills: validSkills
      }));
    }
  }, [formData.requiredSkills, setFormData]);

  return {
    handleSkillChange,
    isSkillSelected,
    getUnmatchedSkills,
    cleanupSkills,
  };
}
