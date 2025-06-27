
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
 * 
 * PHASE 1 LOGGING: Added comprehensive logging to trace staff ID flow
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

  // PHASE 1 LOGGING: Log preferred staff hook data
  console.log(`🎛️ [MATRIX CONTROLS HOOK] PHASE 1 LOGGING: Preferred Staff Hook Data:`, {
    availablePreferredStaffCount: availablePreferredStaff.length,
    availablePreferredStaff: availablePreferredStaff.map(staff => ({
      id: staff.id,
      idType: typeof staff.id,
      name: staff.name,
      role: staff.roleTitle
    })),
    preferredStaffLoading,
    preferredStaffError,
    hookExecutionTime: new Date().toISOString()
  });

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

  // PHASE 1 LOGGING: Log selection calculations
  console.log(`🎛️ [MATRIX CONTROLS HOOK] PHASE 1 LOGGING: Selection calculations:`, {
    isAllPreferredStaffSelected,
    selectedCount: state.selectedPreferredStaff.length,
    availableCount: availablePreferredStaff.length,
    selectionRatio: availablePreferredStaff.length > 0 ? (state.selectedPreferredStaff.length / availablePreferredStaff.length) : 0,
    calculationTime: new Date().toISOString()
  });

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
      const newState = {
        ...state,
        selectedSkills: availableSkills,
        selectedClients: availableClients.map(client => client.id),
        // FIXED: Keep preferred staff empty initially (shows all data)
        selectedPreferredStaff: []
      };

      // PHASE 1 LOGGING: Log initialization
      console.log(`🎛️ [MATRIX CONTROLS HOOK] PHASE 1 LOGGING: State initialization:`, {
        previousState: state,
        newState,
        availableSkillsCount: availableSkills.length,
        availableClientsCount: availableClients.length,
        availablePreferredStaffCount: availablePreferredStaff.length,
        initializationTime: new Date().toISOString()
      });

      setState(newState);
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

  // FIXED: Handle preferred staff toggle with PHASE 1 LOGGING
  const handlePreferredStaffToggle = useCallback((staffId: string) => {
    setState(prev => {
      const wasSelected = prev.selectedPreferredStaff.includes(staffId);
      const newSelectedPreferredStaff = wasSelected
        ? prev.selectedPreferredStaff.filter(s => s !== staffId)
        : [...prev.selectedPreferredStaff, staffId];

      const staffName = availablePreferredStaff.find(s => s.id === staffId)?.name || 'Unknown';

      // PHASE 1 LOGGING: Comprehensive toggle logging
      console.log(`🔧 [MATRIX CONTROLS HOOK] PHASE 1 LOGGING: Preferred staff toggle:`, {
        staffId,
        staffIdType: typeof staffId,
        staffName,
        action: wasSelected ? 'removed' : 'added',
        previousSelection: prev.selectedPreferredStaff,
        previousSelectionTypes: prev.selectedPreferredStaff.map(id => ({ id, type: typeof id })),
        newSelection: newSelectedPreferredStaff,
        newSelectionTypes: newSelectedPreferredStaff.map(id => ({ id, type: typeof id })),
        newCount: newSelectedPreferredStaff.length,
        totalAvailable: availablePreferredStaff.length,
        willShowAllData: newSelectedPreferredStaff.length === 0,
        toggleTime: new Date().toISOString(),
        availableStaffContext: availablePreferredStaff.map(staff => ({
          id: staff.id,
          idType: typeof staff.id,
          name: staff.name,
          isBeingToggled: staff.id === staffId
        }))
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
    const resetState = {
      selectedSkills: availableSkills,
      selectedClients: availableClients.map(client => client.id),
      monthRange: { start: 0, end: 11 },
      selectedPreferredStaff: [] // FIXED: Reset to empty = show all data
    };

    // PHASE 1 LOGGING: Log reset operation
    console.log(`🔄 [MATRIX CONTROLS HOOK] PHASE 1 LOGGING: Reset operation:`, {
      previousState: state,
      resetState,
      skillsCount: availableSkills.length,
      clientsCount: availableClients.length,
      preferredStaffCount: 0, // Reset to no filter
      availablePreferredStaffCount: availablePreferredStaff.length,
      resetTime: new Date().toISOString()
    });

    setState(resetState);
  }, [availableSkills, availableClients, availablePreferredStaff, state]);

  // PHASE 1 LOGGING: Log hook execution state
  console.log(`🎛️ [MATRIX CONTROLS HOOK] PHASE 1 LOGGING: Hook execution state:`, {
    currentState: state,
    currentStateTypes: {
      selectedSkills: state.selectedSkills.map(skill => ({ skill, type: typeof skill })),
      selectedClients: state.selectedClients.map(id => ({ id, type: typeof id })),
      selectedPreferredStaff: state.selectedPreferredStaff.map(id => ({ id, type: typeof id }))
    },
    calculations: {
      isAllSkillsSelected,
      isAllClientsSelected,
      isAllPreferredStaffSelected
    },
    dataAvailability: {
      demandDataAvailable: !!demandData,
      skillsLoading,
      clientsLoading,
      preferredStaffLoading
    },
    executionTime: new Date().toISOString()
  });

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
