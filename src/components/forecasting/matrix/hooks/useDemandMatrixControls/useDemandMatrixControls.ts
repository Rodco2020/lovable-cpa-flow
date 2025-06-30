
import { useState } from 'react';
import { useClients } from '@/hooks/useClients';
import { useSkills } from '@/hooks/useSkills';
import { useMatrixFiltering } from '../useMatrixFiltering';
import { useMatrixExport } from '../useMatrixExport';
import { useAvailablePreferredStaff } from '../useAvailablePreferredStaff';
import { 
  DemandMatrixControlsState, 
  UseDemandMatrixControlsProps, 
  UseDemandMatrixControlsResult 
} from './types';
import { createStateHandlers } from './stateManagement';
import { calculateSelectionStates } from './calculations';
import { useInitialization } from './initialization';
import { logHookState } from './logging';

/**
 * PHASE 3 FIX: Refactored Demand Matrix Controls Hook
 * 
 * Enhanced with comprehensive staff ID normalization, validation, and testing to ensure
 * robust filtering operations. All staff ID operations now use the shared normalization
 * utility with enhanced error handling and diagnostics.
 * 
 * Refactored for improved maintainability while preserving all existing functionality.
 */
export const useDemandMatrixControls = ({ 
  demandData, 
  groupingMode 
}: UseDemandMatrixControlsProps): UseDemandMatrixControlsResult => {
  // Initialize state with empty preferred staff array (shows all data by default)
  const [state, setState] = useState<DemandMatrixControlsState>({
    selectedSkills: [],
    selectedClients: [],
    monthRange: { start: 0, end: 11 },
    selectedPreferredStaff: [] // Start with empty array = no filtering
  });

  // Fetch external data for loading states
  const { data: skillsData, isLoading: skillsLoading } = useSkills();
  const { data: clientsData, isLoading: clientsLoading } = useClients();

  // Fetch preferred staff data
  const { 
    availablePreferredStaff, 
    isLoading: preferredStaffLoading, 
    error: preferredStaffError,
    refetch: refetchPreferredStaff 
  } = useAvailablePreferredStaff();

  // Use filtering logic hook
  const {
    availableSkills,
    availableClients,
    isAllSkillsSelected: filteredIsAllSkillsSelected,
    isAllClientsSelected: filteredIsAllClientsSelected
  } = useMatrixFiltering({
    demandData,
    selectedSkills: state.selectedSkills,
    selectedClients: state.selectedClients,
    selectedPreferredStaff: state.selectedPreferredStaff,
    monthRange: state.monthRange,
    groupingMode
  });

  // Calculate selection states
  const calculatedStates = calculateSelectionStates(
    state.selectedSkills,
    state.selectedClients,
    state.selectedPreferredStaff,
    availableSkills,
    availableClients,
    availablePreferredStaff
  );

  // Create state handlers - Fixed: Only pass setState parameter
  const stateHandlers = createStateHandlers(setState);

  // Use export functionality hook
  const { handleExport } = useMatrixExport({
    demandData,
    selectedSkills: state.selectedSkills,
    selectedClients: state.selectedClients,
    monthRange: state.monthRange,
    groupingMode,
    availableSkills,
    availableClients,
    isAllSkillsSelected: calculatedStates.isAllSkillsSelected,
    isAllClientsSelected: calculatedStates.isAllClientsSelected
  });

  // Initialize selections when data becomes available
  useInitialization(demandData, state, setState, availableSkills, availableClients);

  // Log hook state for debugging
  logHookState(
    state,
    availablePreferredStaff,
    calculatedStates,
    { skillsLoading, clientsLoading, preferredStaffLoading },
    demandData
  );

  return {
    ...state,
    ...stateHandlers,
    handleExport,
    availableSkills,
    availableClients,
    skillsLoading,
    clientsLoading,
    isAllSkillsSelected: calculatedStates.isAllSkillsSelected,
    isAllClientsSelected: calculatedStates.isAllClientsSelected,
    
    // Enhanced preferred staff functionality
    availablePreferredStaff,
    preferredStaffLoading,
    preferredStaffError,
    isAllPreferredStaffSelected: calculatedStates.isAllPreferredStaffSelected,
    refetchPreferredStaff
  };
};
