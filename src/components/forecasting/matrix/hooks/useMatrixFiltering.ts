
import { useMemo } from 'react';
import { SkillType } from '@/types/task';
import { DemandMatrixData } from '@/types/demand';

interface UseMatrixFilteringProps {
  demandData?: DemandMatrixData | null;
  selectedSkills: SkillType[];
  selectedClients: string[];
  monthRange: { start: number; end: number };
  groupingMode: 'skill' | 'client';
}

/**
 * Hook for managing matrix filtering logic
 * 
 * Handles all filtering operations for the demand matrix, including:
 * - Available options extraction from data
 * - Selection state calculations
 * - Filter application logic
 */
export const useMatrixFiltering = ({
  demandData,
  selectedSkills,
  selectedClients,
  monthRange,
  groupingMode
}: UseMatrixFilteringProps) => {
  // Extract available options from demand data
  const availableSkills = useMemo(() => {
    return demandData?.skills || [];
  }, [demandData?.skills]);

  // Extract ALL unique clients from task breakdowns without any limits
  const availableClients = useMemo(() => {
    return Array.from(new Set(
      demandData?.dataPoints.flatMap(point => 
        point.taskBreakdown
          .filter(task => task.clientName && !task.clientName.includes('...'))
          .map(task => ({
            id: task.clientId,
            name: task.clientName
          }))
      ) || []
    ));
  }, [demandData?.dataPoints]);

  // Calculate selection state flags for proper filtering logic
  const isAllSkillsSelected = useMemo(() => {
    return availableSkills.length > 0 && selectedSkills.length === availableSkills.length;
  }, [availableSkills.length, selectedSkills.length]);

  const isAllClientsSelected = useMemo(() => {
    return availableClients.length > 0 && selectedClients.length === availableClients.length;
  }, [availableClients.length, selectedClients.length]);

  // Log filtering state for debugging
  console.log(`🎛️ [MATRIX FILTERING] Available options:`, {
    availableSkills: availableSkills.length,
    availableClients: availableClients.length,
    selectedSkills: selectedSkills.length,
    selectedClients: selectedClients.length,
    isAllSkillsSelected,
    isAllClientsSelected
  });

  return {
    availableSkills,
    availableClients,
    isAllSkillsSelected,
    isAllClientsSelected
  };
};
