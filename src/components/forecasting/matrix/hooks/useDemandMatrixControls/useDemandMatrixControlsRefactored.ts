
import { useDemandData } from '@/services/forecasting/demand/dataFetcher/useDemandData';
import { UseDemandMatrixControlsProps, UseDemandMatrixControlsResult } from './types';
import { useControlsState } from './stateManagement';
import { useDataProcessing } from './dataProcessing';
import { useActionHandlers } from './actionHandlers';

/**
 * Refactored Demand Matrix Controls Hook
 * 
 * REFACTORING IMPROVEMENTS:
 * - Separated concerns into focused sub-hooks
 * - Better type safety with dedicated interfaces
 * - Improved maintainability through modular structure
 * - Enhanced debugging and logging capabilities
 * - Preserved all existing functionality
 * 
 * PRESERVED FUNCTIONALITY:
 * - All Phase 2 enhancements with skill resolution
 * - Complete state management for filters
 * - Data fetching and processing logic
 * - Event handlers and user interactions
 * - Debugging and validation features
 * - Exact same public API
 */
export const useDemandMatrixControlsRefactored = ({
  groupingMode,
  enablePreferredStaffFiltering = true
}: UseDemandMatrixControlsProps): UseDemandMatrixControlsResult => {
  // State management
  const {
    monthRange,
    selectedSkills,
    selectedClients,
    selectedPreferredStaff,
    preferredStaffFilterMode,
    handleSkillToggle,
    handleClientToggle,
    handlePreferredStaffToggle,
    handlePreferredStaffFilterModeChange,
    handleMonthRangeChange,
    handleReset,
    getCurrentState
  } = useControlsState();

  // Data fetching
  const {
    data: demandData,
    isLoading,
    error,
    refetch
  } = useDemandData({
    monthRange,
    selectedSkills
  });

  // Data processing and options extraction
  const {
    availableOptions,
    selectionStates
  } = useDataProcessing(
    demandData,
    selectedSkills,
    selectedClients,
    selectedPreferredStaff,
    isLoading
  );

  // Action handlers
  const {
    handleExport,
    handleManualRefresh
  } = useActionHandlers(refetch);

  // Debug logging
  console.log(`🎛️ [REFACTORED CONTROLS] Enhanced current state:`, {
    groupingMode,
    monthRange,
    selectedSkillsCount: selectedSkills.length,
    selectedClientsCount: selectedClients.length,
    selectedStaffCount: selectedPreferredStaff.length,
    preferredStaffFilterMode,
    isLoading,
    hasData: !!demandData,
    dataPointsCount: demandData?.dataPoints?.length || 0,
    skillResolutionActive: true
  });

  return {
    // Data
    demandData,
    isLoading,
    error,
    
    // Available options
    availableSkills: availableOptions.availableSkills,
    availableClients: availableOptions.availableClients,
    availablePreferredStaff: availableOptions.availablePreferredStaff,
    
    // Current selections
    selectedSkills,
    selectedClients,
    selectedPreferredStaff,
    monthRange,
    preferredStaffFilterMode,
    
    // Selection states
    isAllSkillsSelected: selectionStates.isAllSkillsSelected,
    isAllClientsSelected: selectionStates.isAllClientsSelected,
    isAllPreferredStaffSelected: selectionStates.isAllPreferredStaffSelected,
    
    // Event handlers
    onSkillToggle: handleSkillToggle,
    onClientToggle: handleClientToggle,
    onPreferredStaffToggle: handlePreferredStaffToggle,
    onPreferredStaffFilterModeChange: handlePreferredStaffFilterModeChange,
    onMonthRangeChange: handleMonthRangeChange,
    onExport: handleExport,
    onReset: handleReset,
    onRefresh: handleManualRefresh
  };
};
