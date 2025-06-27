
import { DemandMatrixControlsState, UseDemandMatrixControlsResult } from './types';
import { normalizeStaffId, compareStaffIds } from '@/utils/staffIdUtils';

export const logHookState = (
  state: DemandMatrixControlsState,
  availablePreferredStaff: Array<{ id: string; name: string; roleTitle?: string }>,
  calculations: {
    isAllSkillsSelected: boolean;
    isAllClientsSelected: boolean;
    isAllPreferredStaffSelected: boolean;
  },
  loadingStates: {
    skillsLoading: boolean;
    clientsLoading: boolean;
    preferredStaffLoading: boolean;
  },
  demandData: any
) => {
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
    preferredStaffLoading: loadingStates.preferredStaffLoading,
    hookExecutionTime: new Date().toISOString(),
    dataQuality: {
      allIdsNormalized: availablePreferredStaff.every(staff => staff.id === staff.id.toLowerCase()),
      uniqueIdCount: new Set(availablePreferredStaff.map(s => s.id)).size,
      duplicateIdsDetected: availablePreferredStaff.length !== new Set(availablePreferredStaff.map(s => s.id)).size
    }
  });

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
    calculations,
    dataAvailability: {
      demandDataAvailable: !!demandData,
      ...loadingStates
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
};
