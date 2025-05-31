
import { useCallback } from 'react';
import { SkillType } from '@/types/task';
import { MatrixControlsState } from './types';

/**
 * State Handlers
 * Centralized state update handlers for matrix controls
 */
export const useStateHandlers = (
  setState: React.Dispatch<React.SetStateAction<MatrixControlsState>>,
  availableSkills: SkillType[],
  matrixSkills: SkillType[]
) => {
  const handleSkillToggle = useCallback((skill: SkillType) => {
    setState(prev => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skill)
        ? prev.selectedSkills.filter(s => s !== skill)
        : [...prev.selectedSkills, skill]
    }));
  }, [setState]);

  const handleViewModeChange = useCallback((viewMode: 'hours' | 'percentage') => {
    setState(prev => ({ ...prev, viewMode }));
  }, [setState]);

  const handleMonthRangeChange = useCallback((monthRange: { start: number; end: number }) => {
    setState(prev => ({ ...prev, monthRange }));
  }, [setState]);

  const handleReset = useCallback(async () => {
    // Use all relevant skills (available + matrix) for reset
    const allRelevantSkills = new Set([...availableSkills, ...matrixSkills]);
    const skillsArray = Array.from(allRelevantSkills);
    
    setState({
      selectedSkills: skillsArray,
      viewMode: 'hours',
      monthRange: { start: 0, end: 11 }
    });
  }, [availableSkills, matrixSkills, setState]);

  return {
    handleSkillToggle,
    handleViewModeChange,
    handleMonthRangeChange,
    handleReset
  };
};
