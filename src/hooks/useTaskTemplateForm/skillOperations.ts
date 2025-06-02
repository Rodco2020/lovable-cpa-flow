
import { useCallback } from 'react';
import { Skill } from '@/types/skill';

interface FormState {
  name: string;
  description: string;
  defaultEstimatedHours: number;
  requiredSkills: string[];
  defaultPriority: string;
  category: string;
}

interface UseSkillOperationsProps {
  formData: FormState;
  setFormData: React.Dispatch<React.SetStateAction<FormState>>;
}

export function useSkillOperations(
  formData: FormState,
  setFormData: React.Dispatch<React.SetStateAction<FormState>>
) {
  const handleSkillChange = useCallback((skillId: string, checked: boolean) => {
    console.log('SkillOperations: Handling skill change:', { skillId, checked });
    setFormData(prev => {
      const currentSkills = prev.requiredSkills || [];
      let updatedSkills: string[];
      
      if (checked) {
        // Add skill if not already present
        updatedSkills = currentSkills.includes(skillId) 
          ? currentSkills 
          : [...currentSkills, skillId];
      } else {
        // Remove skill
        updatedSkills = currentSkills.filter(id => id !== skillId);
      }
      
      const updated = { ...prev, requiredSkills: updatedSkills };
      console.log('SkillOperations: Updated skills:', { 
        oldSkills: currentSkills, 
        newSkills: updatedSkills,
        formData: updated
      });
      return updated;
    });
  }, [setFormData]);

  const isSkillSelected = useCallback((skillId: string): boolean => {
    const selected = (formData.requiredSkills || []).includes(skillId);
    console.log('SkillOperations: Checking if skill selected:', { skillId, selected });
    return selected;
  }, [formData.requiredSkills]);

  const getUnmatchedSkills = useCallback((availableSkills: Array<{id: string, name: string}>): string[] => {
    const availableSkillIds = new Set(availableSkills.map(skill => skill.id));
    const unmatchedSkills = (formData.requiredSkills || []).filter(skillId => !availableSkillIds.has(skillId));
    
    console.log('SkillOperations: Finding unmatched skills:', {
      availableSkillIds: Array.from(availableSkillIds),
      requiredSkills: formData.requiredSkills,
      unmatchedSkills
    });
    
    return unmatchedSkills;
  }, [formData.requiredSkills]);

  const cleanupSkills = useCallback((availableSkills: Array<{id: string, name: string}>): void => {
    const availableSkillIds = new Set(availableSkills.map(skill => skill.id));
    const cleanedSkills = (formData.requiredSkills || []).filter(skillId => availableSkillIds.has(skillId));
    
    if (cleanedSkills.length !== (formData.requiredSkills || []).length) {
      console.log('SkillOperations: Cleaning up invalid skills:', {
        originalSkills: formData.requiredSkills,
        cleanedSkills,
        removedSkills: (formData.requiredSkills || []).filter(skillId => !availableSkillIds.has(skillId))
      });
      
      setFormData(prev => ({ ...prev, requiredSkills: cleanedSkills }));
    }
  }, [formData.requiredSkills, setFormData]);

  return {
    handleSkillChange,
    isSkillSelected,
    getUnmatchedSkills,
    cleanupSkills,
  };
}
