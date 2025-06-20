
import { useState, useCallback } from 'react';
import { useMatrixControls } from './useMatrixControls';
import { useDemandData } from '@/services/forecasting/demand/dataFetcher/useDemandData';

interface DemandMatrixControlsState {
  selectedClients: string[];
  selectedPreferredStaff: string[];
  isAllClientsSelected: boolean;
  isAllPreferredStaffSelected: boolean;
  // Phase 2: Enhanced three-mode filter state
  preferredStaffFilterMode: 'all' | 'specific' | 'none';
}

interface UseDemandMatrixControlsProps {
  groupingMode: 'skill' | 'client';
  enablePreferredStaffFiltering?: boolean;
}

/**
 * Phase 2: Enhanced Demand Matrix Controls Hook
 * 
 * PHASE 2 ENHANCEMENTS:
 * - Added preferredStaffFilterMode state management
 * - Implemented onPreferredStaffFilterModeChange handler
 * - Enhanced three-mode system integration
 * - Maintained all existing functionality
 * - Added proper error handling and loading states
 */
export const useDemandMatrixControls = ({ 
  groupingMode,
  enablePreferredStaffFiltering = false
}: UseDemandMatrixControlsProps) => {
  // Get base matrix controls
  const baseControls = useMatrixControls();

  // Get demand data
  const { data: demandData, isLoading, error } = useDemandData({
    monthRange: baseControls.monthRange,
    selectedSkills: baseControls.selectedSkills
  });

  // Phase 2: Enhanced demand-specific state with three-mode system
  const [demandState, setDemandState] = useState<DemandMatrixControlsState>({
    selectedClients: [],
    selectedPreferredStaff: [],
    isAllClientsSelected: true,
    isAllPreferredStaffSelected: true,
    preferredStaffFilterMode: 'all' // Phase 2: Default to 'all' mode
  });

  // Extract available options from demand data
  const availableClients = demandData?.availableClients || [];
  const availablePreferredStaff = demandData?.availablePreferredStaff || [];

  // Handlers for client filtering
  const onClientToggle = useCallback((clientId: string) => {
    setDemandState(prev => {
      const isSelected = prev.selectedClients.includes(clientId);
      const newSelected = isSelected
        ? prev.selectedClients.filter(id => id !== clientId)
        : [...prev.selectedClients, clientId];
      
      return {
        ...prev,
        selectedClients: newSelected,
        isAllClientsSelected: newSelected.length === availableClients.length
      };
    });
  }, [availableClients.length]);

  // Handlers for preferred staff filtering
  const onPreferredStaffToggle = useCallback((staffId: string) => {
    setDemandState(prev => {
      const isSelected = prev.selectedPreferredStaff.includes(staffId);
      const newSelected = isSelected
        ? prev.selectedPreferredStaff.filter(id => id !== staffId)
        : [...prev.selectedPreferredStaff, staffId];
      
      return {
        ...prev,
        selectedPreferredStaff: newSelected,
        isAllPreferredStaffSelected: newSelected.length === availablePreferredStaff.length
      };
    });
  }, [availablePreferredStaff.length]);

  // Phase 2: Handler for preferred staff filter mode changes
  const onPreferredStaffFilterModeChange = useCallback((mode: 'all' | 'specific' | 'none') => {
    console.log(`🎯 [PHASE 2 CONTROLS] Changing preferred staff filter mode:`, {
      from: demandState.preferredStaffFilterMode,
      to: mode,
      selectedStaffCount: demandState.selectedPreferredStaff.length
    });

    setDemandState(prev => ({
      ...prev,
      preferredStaffFilterMode: mode
    }));
  }, [demandState.preferredStaffFilterMode, demandState.selectedPreferredStaff.length]);

  // Phase 2: Enhanced reset function that includes three-mode resets
  const onReset = useCallback(() => {
    console.log(`🔄 [PHASE 2 CONTROLS] Resetting all filters including three-mode system`);
    
    baseControls.handleReset();
    setDemandState({
      selectedClients: [],
      selectedPreferredStaff: [],
      isAllClientsSelected: true,
      isAllPreferredStaffSelected: true,
      preferredStaffFilterMode: 'all' // Phase 2: Reset to default mode
    });
  }, [baseControls]);

  // Export function that includes demand-specific data
  const onExport = useCallback(() => {
    console.log(`📤 [PHASE 2 CONTROLS] Exporting demand matrix data with filter mode:`, {
      preferredStaffFilterMode: demandState.preferredStaffFilterMode,
      selectedStaffCount: demandState.selectedPreferredStaff.length
    });
    
    baseControls.handleExport();
  }, [baseControls, demandState.preferredStaffFilterMode, demandState.selectedPreferredStaff.length]);

  return {
    // Base controls
    ...baseControls,
    
    // Demand-specific data
    demandData,
    isLoading,
    error,
    
    // Phase 2: Enhanced demand-specific state with three-mode system
    ...demandState,
    
    // Available options
    availableClients,
    availablePreferredStaff,
    
    // Handlers with correct names
    onSkillToggle: baseControls.handleSkillToggle,
    onClientToggle,
    onPreferredStaffToggle,
    onPreferredStaffFilterModeChange, // Phase 2: New three-mode handler
    onMonthRangeChange: baseControls.handleMonthRangeChange,
    onExport,
    onReset,
    
    // Computed properties
    isAllSkillsSelected: baseControls.selectedSkills.length === baseControls.availableSkills.length
  };
};
