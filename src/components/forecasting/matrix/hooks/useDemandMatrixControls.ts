
import { useState, useCallback } from 'react';
import { useMatrixControls } from './useMatrixControls';
import { useDemandData } from '@/services/forecasting/demand/dataFetcher/useDemandData';

interface DemandMatrixControlsState {
  selectedClients: string[];
  selectedPreferredStaff: string[];
  isAllClientsSelected: boolean;
  isAllPreferredStaffSelected: boolean;
  preferredStaffFilterMode: 'all' | 'specific' | 'none';
}

interface UseDemandMatrixControlsProps {
  groupingMode: 'skill' | 'client';
  enablePreferredStaffFiltering?: boolean;
}

/**
 * Enhanced Demand Matrix Controls Hook
 * 
 * Extends the base matrix controls with demand-specific functionality
 * including client filtering, preferred staff filtering, and three-mode system
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

  // Demand-specific state
  const [demandState, setDemandState] = useState<DemandMatrixControlsState>({
    selectedClients: [],
    selectedPreferredStaff: [],
    isAllClientsSelected: true,
    isAllPreferredStaffSelected: true,
    preferredStaffFilterMode: 'all'
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

  // Handler for preferred staff filter mode
  const onPreferredStaffFilterModeChange = useCallback((mode: 'all' | 'specific' | 'none') => {
    setDemandState(prev => ({
      ...prev,
      preferredStaffFilterMode: mode
    }));
  }, []);

  // Reset function that includes demand-specific resets
  const onReset = useCallback(() => {
    baseControls.handleReset();
    setDemandState({
      selectedClients: [],
      selectedPreferredStaff: [],
      isAllClientsSelected: true,
      isAllPreferredStaffSelected: true,
      preferredStaffFilterMode: 'all'
    });
  }, [baseControls]);

  // Export function that includes demand-specific data
  const onExport = useCallback(() => {
    // Implementation for exporting demand matrix data
    console.log('Exporting demand matrix data...');
    baseControls.handleExport();
  }, [baseControls]);

  return {
    // Base controls
    ...baseControls,
    
    // Demand-specific data
    demandData,
    isLoading,
    error,
    
    // Demand-specific state
    ...demandState,
    
    // Available options
    availableClients,
    availablePreferredStaff,
    
    // Handlers with correct names
    onSkillToggle: baseControls.handleSkillToggle,
    onClientToggle,
    onPreferredStaffToggle,
    onPreferredStaffFilterModeChange,
    onMonthRangeChange: baseControls.handleMonthRangeChange,
    onExport,
    onReset,
    
    // Computed properties
    isAllSkillsSelected: baseControls.selectedSkills.length === baseControls.availableSkills.length
  };
};
