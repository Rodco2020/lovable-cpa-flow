
import { useEffect } from 'react';
import { SkillType } from '@/types/task';
import { DemandMatrixData } from '@/types/demand';
import { DemandMatrixControlsState } from './types';

export const useInitialization = (
  demandData: DemandMatrixData | null | undefined,
  state: DemandMatrixControlsState,
  setState: React.Dispatch<React.SetStateAction<DemandMatrixControlsState>>,
  availableSkills: SkillType[],
  availableClients: Array<{ id: string; name: string }>
) => {
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
  }, [demandData, availableSkills, availableClients, setState, state]);
};
