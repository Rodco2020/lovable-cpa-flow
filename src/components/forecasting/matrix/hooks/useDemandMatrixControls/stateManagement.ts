
import { useCallback } from 'react';
import { SkillType } from '@/types/task';
import { DemandMatrixControlsState } from './types';
import { normalizeStaffId, isStaffIdInArray, compareStaffIds } from '@/utils/staffIdUtils';

export interface StateHandlers {
  handleSkillToggle: (skill: SkillType) => void;
  handleClientToggle: (clientId: string) => void;
  handleMonthRangeChange: (monthRange: { start: number; end: number }) => void;
  handlePreferredStaffToggle: (staffId: string) => void;
  handleReset: () => void;
}

export const createStateHandlers = (
  setState: React.Dispatch<React.SetStateAction<DemandMatrixControlsState>>,
  availableSkills: SkillType[],
  availableClients: Array<{ id: string; name: string }>,
  availablePreferredStaff: Array<{ id: string; name: string; roleTitle?: string }>
): StateHandlers => {
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
  }, [setState]);

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
  }, [setState]);

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
  }, [setState, availablePreferredStaff]);

  const handleMonthRangeChange = useCallback((monthRange: { start: number; end: number }) => {
    setState(prev => ({
      ...prev,
      monthRange
    }));
  }, [setState]);

  const handleReset = useCallback(() => {
    const resetState = {
      selectedSkills: availableSkills,
      selectedClients: availableClients.map(client => client.id),
      monthRange: { start: 0, end: 11 },
      selectedPreferredStaff: [] // Reset to empty = show all data
    };

    console.log(`🔄 [MATRIX CONTROLS HOOK] PHASE 3: Enhanced reset operation:`, {
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
  }, [setState, availableSkills, availableClients]);

  return {
    handleSkillToggle,
    handleClientToggle,
    handleMonthRangeChange,
    handlePreferredStaffToggle,
    handleReset
  };
};
