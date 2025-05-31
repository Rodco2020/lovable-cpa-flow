
import { useState, useCallback } from 'react';
import { useMatrixSkills } from '../useMatrixSkills';
import { 
  MatrixControlsState, 
  UseMatrixControlsProps, 
  UseMatrixControlsResult 
} from './types';
import { useSkillsSync, getEffectiveSkills } from './skillsSync';
import { useStateHandlers } from './stateHandlers';
import { useExportHandler } from './exportUtils';

/**
 * Enhanced Matrix Controls Hook
 * 
 * Manages matrix control state with enhanced skills synchronization.
 * Refactored for improved maintainability while preserving all existing functionality.
 * 
 * @param props - Configuration options for the hook
 * @returns Matrix controls state and handlers
 */
export const useMatrixControls = ({ 
  initialState = {},
  matrixSkills = []
}: UseMatrixControlsProps = {}): UseMatrixControlsResult => {
  // Initialize skills data integration
  const { availableSkills, isLoading: skillsLoading } = useMatrixSkills();
  
  // Initialize state with defaults
  const [state, setState] = useState<MatrixControlsState>({
    selectedSkills: initialState.selectedSkills || [],
    viewMode: initialState.viewMode || 'hours',
    monthRange: initialState.monthRange || { start: 0, end: 11 }
  });

  // Handle skills synchronization
  useSkillsSync(availableSkills, matrixSkills, skillsLoading, setState);

  // Initialize state handlers
  const {
    handleSkillToggle,
    handleViewModeChange,
    handleMonthRangeChange,
    handleReset
  } = useStateHandlers(setState, availableSkills, matrixSkills);

  // Initialize export functionality
  const effectiveSkills = getEffectiveSkills(availableSkills, matrixSkills);
  const handleExport = useExportHandler(state, effectiveSkills);

  return {
    ...state,
    handleSkillToggle,
    handleViewModeChange,
    handleMonthRangeChange,
    handleReset,
    handleExport,
    availableSkills: effectiveSkills,
    skillsLoading
  };
};
