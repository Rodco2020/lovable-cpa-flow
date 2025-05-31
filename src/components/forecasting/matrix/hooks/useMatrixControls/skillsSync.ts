
import { useEffect } from 'react';
import { SkillType } from '@/types/task';
import { MatrixControlsState } from './types';
import { debugLog } from '@/services/forecasting/logger';

/**
 * Skills Synchronization Logic
 * Handles synchronization between available skills, matrix skills, and selected skills
 */
export const useSkillsSync = (
  availableSkills: SkillType[],
  matrixSkills: SkillType[],
  skillsLoading: boolean,
  setState: React.Dispatch<React.SetStateAction<MatrixControlsState>>
) => {
  useEffect(() => {
    if (!skillsLoading && availableSkills.length > 0) {
      setState(prev => {
        // Combine available skills and matrix skills for comprehensive skill set
        const allRelevantSkills = new Set([...availableSkills, ...matrixSkills]);
        const skillsArray = Array.from(allRelevantSkills);
        
        // If no skills selected yet, select all relevant skills
        if (prev.selectedSkills.length === 0) {
          debugLog('Auto-selecting all relevant skills', { count: skillsArray.length });
          return {
            ...prev,
            selectedSkills: skillsArray
          };
        }

        // Validate and normalize current selection
        const validSelectedSkills = prev.selectedSkills.filter(skill => 
          allRelevantSkills.has(skill)
        );
        
        // Only update if there's a meaningful change
        if (validSelectedSkills.length !== prev.selectedSkills.length) {
          debugLog('Updated selected skills after validation', { 
            before: prev.selectedSkills.length, 
            after: validSelectedSkills.length 
          });
          return { ...prev, selectedSkills: validSelectedSkills };
        }
        
        return prev;
      });
    }
  }, [availableSkills, skillsLoading, matrixSkills, setState]);
};

/**
 * Get effective skills list (combination of available and matrix skills)
 */
export const getEffectiveSkills = (
  availableSkills: SkillType[], 
  matrixSkills: SkillType[]
): SkillType[] => {
  const allSkills = new Set([...availableSkills, ...matrixSkills]);
  return Array.from(allSkills).sort();
};
