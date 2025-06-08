
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
import { useClientExtensions } from './clientExtensions';

/**
 * Enhanced Matrix Controls Hook with Client Filtering
 * 
 * Manages matrix control state with enhanced skills synchronization and client filtering.
 * Maintains backward compatibility while adding client filtering capabilities.
 * 
 * @param props - Configuration options for the hook
 * @returns Matrix controls state and handlers with client filtering support
 */
export const useMatrixControls = ({ 
  initialState = {},
  matrixSkills = [],
  forecastType = 'virtual' // Default forecast type for client extensions
}: UseMatrixControlsProps & { forecastType?: 'virtual' | 'actual' } = {}): UseMatrixControlsResult & {
  // Extended result with client filtering
  clientFilter: any;
  setClientFilter: (clientId: string | null, clientName?: string) => void;
  clearClientFilter: () => void;
  isClientModeActive: boolean;
} => {
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

  // Initialize client filtering extensions
  const {
    clientFilter,
    setClientFilter,
    clearClientFilter,
    getEffectiveSkills: getClientEffectiveSkills,
    isClientModeActive
  } = useClientExtensions({
    forecastType,
    onClientFilterChange: (clientId) => {
      // Optional: Could trigger matrix data refresh here
      console.log('Matrix controls: Client filter changed to:', clientId);
    }
  });

  // Get effective skills considering both matrix skills and client context
  const baseEffectiveSkills = getEffectiveSkills(availableSkills, matrixSkills);
  const finalEffectiveSkills = getClientEffectiveSkills(baseEffectiveSkills);

  // Initialize state handlers
  const {
    handleSkillToggle,
    handleViewModeChange,
    handleMonthRangeChange,
    handleReset: baseHandleReset
  } = useStateHandlers(setState, availableSkills, matrixSkills);

  // Enhanced reset that also clears client filter
  const handleReset = useCallback(() => {
    baseHandleReset();
    clearClientFilter();
  }, [baseHandleReset, clearClientFilter]);

  // Initialize export functionality with client-aware skills
  const handleExport = useExportHandler(state, finalEffectiveSkills);

  return {
    ...state,
    handleSkillToggle,
    handleViewModeChange,
    handleMonthRangeChange,
    handleReset,
    handleExport,
    availableSkills: finalEffectiveSkills,
    skillsLoading,
    // Client filtering extensions
    clientFilter,
    setClientFilter,
    clearClientFilter,
    isClientModeActive
  };
};
