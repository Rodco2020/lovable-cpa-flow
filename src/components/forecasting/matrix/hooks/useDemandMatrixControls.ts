import { useState, useEffect, useCallback } from 'react';
import { SkillType } from '@/types/task';
import { DemandMatrixData } from '@/types/demand';
import { useClients } from '@/hooks/useClients';
import { useSkills } from '@/hooks/useSkills';
import { useMatrixFiltering } from './useMatrixFiltering';
import { useMatrixExport } from './useMatrixExport';
import { useAvailablePreferredStaff } from './useAvailablePreferredStaff';

interface UseDemandMatrixControlsProps {
  demandData?: DemandMatrixData | null;
  groupingMode: 'skill' | 'client';
}

interface DemandMatrixControlsState {
  selectedSkills: SkillType[];
  selectedClients: string[];
  monthRange: { start: number; end: number };
  selectedPreferredStaff: string[];
}

/**
 * FIXED: Hook for managing demand matrix controls UI state
 * 
 * Enhanced with proper preferred staff filtering that handles "None" selection correctly.
 * When no preferred staff are selected, all data is shown (no filtering applied).
 */
export const useDemandMatrixControls = ({ 
  demandData, 
  groupingMode 
}: UseDemandMatrixControlsProps) => {
  // FIXED: Initialize state with empty preferred staff array (shows all data by default)
  const [state, setState] = useState<DemandMatrixControlsState>({
    selectedSkills: [],
    selectedClients: [],
    monthRange: { start: 0, end: 11 },
    selectedPreferredStaff: [] // FIXED: Start with empty array = no filtering
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
    isAllSkillsSelected,
    isAllClientsSelected
  } = useMatrixFiltering({
    demandData,
    selectedSkills: state.selectedSkills,
    selectedClients: state.selectedClients,
    selectedPreferredStaff: state.selectedPreferredStaff,
    monthRange: state.monthRange,
    groupingMode
  });

  // FIXED: Calculate if all preferred staff are selected properly
  const isAllPreferredStaffSelected = availablePreferredStaff.length > 0 && 
    state.selectedPreferredStaff.length === availablePreferredStaff.length;

  // Use export functionality hook
  const { handleExport } = useMatrixExport({
    demandData,
    selectedSkills: state.selectedSkills,
    selectedClients: state.selectedClients,
    monthRange: state.monthRange,
    groupingMode,
    availableSkills,
    availableClients,
    isAllSkillsSelected,
    isAllClientsSelected
  });

  // FIXED: Initialize selections when data becomes available - SELECT ALL by default
  useEffect(() => {
    if (demandData && state.selectedSkills.length === 0 && state.selectedClients.length === 0) {
      setState(prev => ({
        ...prev,
        selectedSkills: availableSkills,
        selectedClients: availableClients.map(client => client.id),
        // FIXED: Keep preferred staff empty initially (shows all data)
        selectedPreferredStaff: []
      }));
      
      console.log(`🎛️ [MATRIX CONTROLS] FIXED: Initialized with ALL selections:`, {
        skillsCount: availableSkills.length,
        clientsCount: availableClients.length,
        preferredStaffCount: 0, // Start with no preferred staff filter
        preferredStaffAvailable: availablePreferredStaff.length
      });
    }
  }, [demandData, availableSkills, availableClients, availablePreferredStaff]);

  // Handle skill toggle
  const handleSkillToggle = useCallback((skill: SkillType) => {
    setState(prev => {
      const newSelectedSkills = prev.selectedSkills.includes(skill)
        ? prev.selectedSkills.filter(s => s !== skill)
        : [...prev.selectedSkills, skill];
      
      console.log(`🔧 [MATRIX CONTROLS] Skill toggle:`, {
        skill,
        action: prev.selectedSkills.includes(skill) ? 'removed' : 'added',
        newCount: newSelectedSkills.length,
        totalAvailable: availableSkills.length
      });

      return {
        ...prev,
        selectedSkills: newSelectedSkills
      };
    });
  }, [availableSkills.length]);

  // Handle client toggle
  const handleClientToggle = useCallback((clientId: string) => {
    setState(prev => {
      const newSelectedClients = prev.selectedClients.includes(clientId)
        ? prev.selectedClients.filter(c => c !== clientId)
        : [...prev.selectedClients, clientId];

      console.log(`🔧 [MATRIX CONTROLS] Client toggle:`, {
        clientId,
        action: prev.selectedClients.includes(clientId) ? 'removed' : 'added',
        newCount: newSelectedClients.length,
        totalAvailable: availableClients.length
      });

      return {
        ...prev,
        selectedClients: newSelectedClients
      };
    });
  }, [availableClients.length]);

  // FIXED: Handle preferred staff toggle with proper logging
  const handlePreferredStaffToggle = useCallback((staffId: string) => {
    setState(prev => {
      const newSelectedPreferredStaff = prev.selectedPreferredStaff.includes(staffId)
        ? prev.selectedPreferredStaff.filter(s => s !== staffId)
        : [...prev.selectedPreferredStaff, staffId];

      const staffName = availablePreferredStaff.find(s => s.id === staffId)?.name || 'Unknown';

      console.log(`🔧 [MATRIX CONTROLS] FIXED: Preferred staff toggle:`, {
        staffId,
        staffName,
        action: prev.selectedPreferredStaff.includes(staffId) ? 'removed' : 'added',
        newCount: newSelectedPreferredStaff.length,
        totalAvailable: availablePreferredStaff.length,
        newSelection: newSelectedPreferredStaff,
        willShowAllData: newSelectedPreferredStaff.length === 0
      });

      return {
        ...prev,
        selectedPreferredStaff: newSelectedPreferredStaff
      };
    });
  }, [availablePreferredStaff]);

  // Handle month range change
  const handleMonthRangeChange = useCallback((monthRange: { start: number; end: number }) => {
    setState(prev => ({
      ...prev,
      monthRange
    }));
  }, []);

  // FIXED: Enhanced reset - SELECT ALL clients and skills, CLEAR preferred staff (shows all data)
  const handleReset = useCallback(() => {
    setState({
      selectedSkills: availableSkills,
      selectedClients: availableClients.map(client => client.id),
      monthRange: { start: 0, end: 11 },
      selectedPreferredStaff: [] // FIXED: Reset to empty = show all data
    });
    
    console.log(`🔄 [MATRIX CONTROLS] FIXED: Reset to show all data:`, {
      skillsCount: availableSkills.length,
      clientsCount: availableClients.length,
      preferredStaffCount: 0, // Reset to no filter
      preferredStaffAvailable: availablePreferredStaff.length
    });
  }, [availableSkills, availableClients, availablePreferredStaff]);

  return {
    ...state,
    handleSkillToggle,
    handleClientToggle,
    handleMonthRangeChange,
    handleReset,
    handleExport,
    availableSkills,
    availableClients,
    skillsLoading,
    clientsLoading,
    isAllSkillsSelected,
    isAllClientsSelected,
    
    // Preferred staff functionality
    handlePreferredStaffToggle,
    availablePreferredStaff,
    preferredStaffLoading,
    preferredStaffError,
    isAllPreferredStaffSelected,
    refetchPreferredStaff
  };
};
