
import { useState, useEffect, useCallback } from 'react';
import { SkillType } from '@/types/task';
import { DemandMatrixData } from '@/types/demand';
import { useClients } from '@/hooks/useClients';
import { useSkills } from '@/hooks/useSkills';
import { useMatrixFiltering } from './useMatrixFiltering';
import { useMatrixExport } from './useMatrixExport';
import { useAvailablePreferredStaff } from './useAvailablePreferredStaff';
import { normalizeStaffId, isStaffIdInArray, compareStaffIds } from '@/utils/staffIdUtils';

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
 * PHASE 3 FIX: Hook for managing demand matrix controls with enhanced normalized staff IDs
 * 
 * Enhanced with comprehensive staff ID normalization, validation, and testing to ensure
 * robust filtering operations. All staff ID operations now use the shared normalization
 * utility with enhanced error handling and diagnostics.
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

  // PHASE 3 LOGGING: Enhanced preferred staff hook data analysis
  console.log(`🎛️ [MATRIX CONTROLS HOOK] PHASE 3: Enhanced Preferred Staff Analysis:`, {
    availablePreferredStaffCount: availablePreferredStaff.length,
    availablePreferredStaff: availablePreferredStaff.map(staff => ({
      id: staff.id,
      name: staff.name,
      role: staff.roleTitle,
      isNormalized: staff.id === staff.id.toLowerCase(),
      idLength: staff.id.length,
      isUuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(staff.id)
    })),
    preferredStaffLoading,
    preferredStaffError: preferredStaffError?.message,
    hookExecutionTime: new Date().toISOString(),
    dataQuality: {
      allIdsNormalized: availablePreferredStaff.every(staff => staff.id === staff.id.toLowerCase()),
      uniqueIdCount: new Set(availablePreferredStaff.map(s => s.id)).size,
      duplicateIdsDetected: availablePreferredStaff.length !== new Set(availablePreferredStaff.map(s => s.id)).size
    }
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

  // PHASE 3 FIX: Enhanced preferred staff selection calculation with validation
  const isAllPreferredStaffSelected = availablePreferredStaff.length > 0 && 
    state.selectedPreferredStaff.length === availablePreferredStaff.length &&
    availablePreferredStaff.every(staff => 
      isStaffIdInArray(staff.id, state.selectedPreferredStaff)
    );

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

  // PHASE 3 FIX: Enhanced preferred staff toggle with comprehensive validation and testing
  const handlePreferredStaffToggle = useCallback((staffId: string) => {
    // Normalize the incoming staff ID
    const normalizedStaffId = normalizeStaffId(staffId);
    
    if (!normalizedStaffId) {
      console.warn(`🔧 [MATRIX CONTROLS] PHASE 3: Invalid staff ID provided:`, staffId);
      return;
    }

    // PHASE 3 VALIDATION: Verify staff ID exists in available staff
    const staffExists = availablePreferredStaff.some(staff => 
      compareStaffIds(staff.id, normalizedStaffId)
    );

    if (!staffExists) {
      console.warn(`🔧 [MATRIX CONTROLS] PHASE 3: Staff ID not found in available staff:`, {
        providedId: staffId,
        normalizedId: normalizedStaffId,
        availableStaffIds: availablePreferredStaff.map(s => s.id)
      });
    }

    setState(prev => {
      const wasSelected = isStaffIdInArray(normalizedStaffId, prev.selectedPreferredStaff);
      const newSelectedPreferredStaff = wasSelected
        ? prev.selectedPreferredStaff.filter(id => {
            const normalizedExistingId = normalizeStaffId(id);
            return !compareStaffIds(normalizedExistingId, normalizedStaffId);
          })
        : [...prev.selectedPreferredStaff, normalizedStaffId];

      const staffName = availablePreferredStaff.find(s => 
        compareStaffIds(s.id, normalizedStaffId)
      )?.name || 'Unknown';

      // PHASE 3 LOGGING: Comprehensive toggle logging with enhanced validation
      console.log(`🔧 [MATRIX CONTROLS HOOK] PHASE 3: Enhanced preferred staff toggle:`, {
        originalStaffId: staffId,
        normalizedStaffId,
        staffName,
        staffExists,
        action: wasSelected ? 'removed' : 'added',
        previousSelection: prev.selectedPreferredStaff,
        newSelection: newSelectedPreferredStaff,
        newCount: newSelectedPreferredStaff.length,
        totalAvailable: availablePreferredStaff.length,
        willShowAllData: newSelectedPreferredStaff.length === 0,
        toggleTime: new Date().toISOString(),
        normalizationApplied: staffId !== normalizedStaffId,
        validationResults: {
          idNormalizationSuccess: !!normalizedStaffId,
          staffExistsInAvailable: staffExists,
          selectionStateValid: newSelectedPreferredStaff.every(id => normalizeStaffId(id)),
          allSelectedIdsNormalized: newSelectedPreferredStaff.every(id => id === normalizeStaffId(id))
        }
      });

      // PHASE 3 TEST: Verify selection integrity
      const selectionIntegrityCheck = {
        allIdsNormalized: newSelectedPreferredStaff.every(id => id === normalizeStaffId(id)),
        noDuplicates: new Set(newSelectedPreferredStaff).size === newSelectedPreferredStaff.length,
        allIdsValid: newSelectedPreferredStaff.every(id => normalizeStaffId(id))
      };

      if (!selectionIntegrityCheck.allIdsNormalized || 
          !selectionIntegrityCheck.noDuplicates || 
          !selectionIntegrityCheck.allIdsValid) {
        console.error(`❌ [MATRIX CONTROLS] PHASE 3: Selection integrity check failed:`, {
          selectionIntegrityCheck,
          newSelection: newSelectedPreferredStaff,
          problematicIds: newSelectedPreferredStaff.filter(id => !normalizeStaffId(id))
        });
      }

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

  // PHASE 3 FIX: Enhanced reset with comprehensive validation
  const handleReset = useCallback(() => {
    const resetState = {
      selectedSkills: availableSkills,
      selectedClients: availableClients.map(client => client.id),
      monthRange: { start: 0, end: 11 },
      selectedPreferredStaff: [] // Reset to empty = show all data
    };

    console.log(`🔄 [MATRIX CONTROLS HOOK] PHASE 3: Enhanced reset operation:`, {
      previousState: state,
      resetState,
      resetTime: new Date().toISOString(),
      validationResults: {
        skillsResetValid: resetState.selectedSkills.length === availableSkills.length,
        clientsResetValid: resetState.selectedClients.length === availableClients.length,
        preferredStaffResetValid: resetState.selectedPreferredStaff.length === 0,
        monthRangeResetValid: resetState.monthRange.start === 0 && resetState.monthRange.end === 11
      }
    });

    setState(resetState);
  }, [availableSkills, availableClients, availablePreferredStaff, state]);

  // PHASE 3 LOGGING: Enhanced hook execution state with comprehensive diagnostics
  console.log(`🎛️ [MATRIX CONTROLS HOOK] PHASE 3: Enhanced hook execution state:`, {
    currentState: state,
    selectedPreferredStaffAnalysis: state.selectedPreferredStaff.map(id => ({
      id,
      normalized: normalizeStaffId(id),
      isAlreadyNormalized: id === normalizeStaffId(id),
      existsInAvailable: availablePreferredStaff.some(staff => compareStaffIds(staff.id, id)),
      matchingStaffName: availablePreferredStaff.find(staff => compareStaffIds(staff.id, id))?.name
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
    qualityMetrics: {
      stateConsistency: {
        selectedStaffIdsNormalized: state.selectedPreferredStaff.every(id => id === normalizeStaffId(id)),
        selectedStaffIdsValid: state.selectedPreferredStaff.every(id => normalizeStaffId(id)),
        noDuplicateSelectedStaff: new Set(state.selectedPreferredStaff).size === state.selectedPreferredStaff.length
      },
      availableDataQuality: {
        availableStaffIdsNormalized: availablePreferredStaff.every(staff => staff.id === staff.id.toLowerCase()),
        availableStaffUnique: availablePreferredStaff.length === new Set(availablePreferredStaff.map(s => s.id)).size
      }
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
    
    // Enhanced preferred staff functionality
    handlePreferredStaffToggle,
    availablePreferredStaff,
    preferredStaffLoading,
    preferredStaffError,
    isAllPreferredStaffSelected,
    refetchPreferredStaff
  };
};
