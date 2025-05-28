
import { TaskTemplate } from '@/types/task';

/**
 * Custom hook for managing skill-related operations in task template forms
 * Handles skill selection, validation, and cleanup logic
 */
export function useSkillOperations(
  formData: Partial<TaskTemplate>,
  setFormData: (updater: (prev: Partial<TaskTemplate>) => Partial<TaskTemplate>) => void
) {
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

  return {
    handleSkillChange,
    isSkillSelected,
    getUnmatchedSkills,
    cleanupSkills,
  };
}
