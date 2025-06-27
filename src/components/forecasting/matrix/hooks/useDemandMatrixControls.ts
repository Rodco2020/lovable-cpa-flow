
import { useState, useEffect, useCallback } from 'react';
import { SkillType } from '@/types/task';
import { DemandMatrixData } from '@/types/demand';
import { useClients } from '@/hooks/useClients';
import { useSkills } from '@/hooks/useSkills';
import { useMatrixFiltering } from './useMatrixFiltering';
import { useMatrixExport } from './useMatrixExport';
import { useAvailablePreferredStaff } from './useAvailablePreferredStaff';
import { normalizeStaffId, isStaffIdInArray } from '@/utils/staffIdUtils';

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
 * PHASE 2 FIX: Hook for managing demand matrix controls with normalized staff IDs
 * 
 * Enhanced with consistent staff ID normalization to prevent filtering mismatches.
 * All staff ID operations now use the shared normalization utility.
 */
export const useDemandMatrixControls = ({ 
  demandData, 
  groupingMode 
}: UseDemandMatrixControlsProps) => {
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

  // PHASE 2 LOGGING: Log normalized preferred staff hook data
  console.log(`🎛️ [MATRIX CONTROLS HOOK] PHASE 2: Preferred Staff Hook Data:`, {
    availablePreferredStaffCount: availablePreferredStaff.length,
    availablePreferredStaff: availablePreferredStaff.map(staff => ({
      id: staff.id,
      name: staff.name,
      role: staff.roleTitle,
      isNormalized: staff.id === staff.id.toLowerCase()
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

  // PHASE 2 FIX: Calculate if all preferred staff are selected properly
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

  // Initialize selections when data becomes available - SELECT ALL by default
  useEffect(() => {
    if (demandData && state.selectedSkills.length === 0 && state.selectedClients.length === 0) {
      const newState = {
        ...state,
        selectedSkills: availableSkills,
        selectedClients: availableClients.map(client => client.id),
        selectedPreferredStaff: [] // Keep preferred staff empty initially (shows all data)
      };

      setState(newState);
    }
  }, [demandData, availableSkills, availableClients, availablePreferredStaff]);

  // Handle skill toggle
  const handleSkillToggle = useCallback((skill: SkillType) => {
    setState(prev => {
      const newSelectedSkills = prev.selectedSkills.includes(skill)
        ? prev.selectedSkills.filter(s => s !== skill)
        : [...prev.selectedSkills, skill];
      
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

      return {
        ...prev,
        selectedClients: newSelectedClients
      };
    });
  }, [availableClients.length]);

  // PHASE 2 FIX: Handle preferred staff toggle with normalized IDs
  const handlePreferredStaffToggle = useCallback((staffId: string) => {
    // Normalize the incoming staff ID
    const normalizedStaffId = normalizeStaffId(staffId);
    
    if (!normalizedStaffId) {
      console.warn(`🔧 [MATRIX CONTROLS] PHASE 2: Invalid staff ID provided:`, staffId);
      return;
    }

    setState(prev => {
      const wasSelected = isStaffIdInArray(normalizedStaffId, prev.selectedPreferredStaff);
      const newSelectedPreferredStaff = wasSelected
        ? prev.selectedPreferredStaff.filter(id => {
            const normalizedExistingId = normalizeStaffId(id);
            return normalizedExistingId !== normalizedStaffId;
          })
        : [...prev.selectedPreferredStaff, normalizedStaffId];

      const staffName = availablePreferredStaff.find(s => normalizeStaffId(s.id) === normalizedStaffId)?.name || 'Unknown';

      // PHASE 2 LOGGING: Comprehensive toggle logging with normalization
      console.log(`🔧 [MATRIX CONTROLS HOOK] PHASE 2: Preferred staff toggle:`, {
        originalStaffId: staffId,
        normalizedStaffId,
        staffName,
        action: wasSelected ? 'removed' : 'added',
        previousSelection: prev.selectedPreferredStaff,
        newSelection: newSelectedPreferredStaff,
        newCount: newSelectedPreferredStaff.length,
        totalAvailable: availablePreferredStaff.length,
        willShowAllData: newSelectedPreferredStaff.length === 0,
        toggleTime: new Date().toISOString(),
        normalizationApplied: staffId !== normalizedStaffId
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

  // PHASE 2 FIX: Enhanced reset - SELECT ALL clients and skills, CLEAR preferred staff (shows all data)
  const handleReset = useCallback(() => {
    const resetState = {
      selectedSkills: availableSkills,
      selectedClients: availableClients.map(client => client.id),
      monthRange: { start: 0, end: 11 },
      selectedPreferredStaff: [] // Reset to empty = show all data
    };

    console.log(`🔄 [MATRIX CONTROLS HOOK] PHASE 2: Reset operation with normalization:`, {
      previousState: state,
      resetState,
      resetTime: new Date().toISOString()
    });

    setState(resetState);
  }, [availableSkills, availableClients, availablePreferredStaff, state]);

  // PHASE 2 LOGGING: Log hook execution state with normalization details
  console.log(`🎛️ [MATRIX CONTROLS HOOK] PHASE 2: Hook execution state:`, {
    currentState: state,
    selectedPreferredStaffNormalized: state.selectedPreferredStaff.map(id => ({
      id,
      normalized: normalizeStaffId(id),
      isAlreadyNormalized: id === normalizeStaffId(id)
    })),
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
