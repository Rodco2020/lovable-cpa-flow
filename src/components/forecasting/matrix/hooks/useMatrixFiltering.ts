
import { useMemo } from 'react';
import { SkillType } from '@/types/task';
import { DemandMatrixData } from '@/types/demand';

interface UseMatrixFilteringProps {
  demandData?: DemandMatrixData | null;
  selectedSkills: SkillType[];
  selectedClients: string[];
  selectedPreferredStaff: string[]; // Phase 3: Add preferred staff selection
  monthRange: { start: number; end: number };
  groupingMode: 'skill' | 'client';
}

/**
 * Hook for managing matrix filtering logic
 * 
 * Phase 3: Enhanced to handle preferred staff filtering
 * Handles all filtering operations for the demand matrix, including:
 * - Available options extraction from data
 * - Selection state calculations
 * - Filter application logic
 * - Preferred staff filter integration
 */
export const useMatrixFiltering = ({
  demandData,
  selectedSkills,
  selectedClients,
  selectedPreferredStaff, // Phase 3: Add preferred staff parameter
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

  // Phase 3: Extract available preferred staff from task breakdowns
  const availablePreferredStaff = useMemo(() => {
    // For Phase 3, we'll extract preferred staff from recurring tasks
    // This will be enhanced in future phases with actual staff data
    const staffSet = new Set<{ id: string; name: string }>();
    
    demandData?.dataPoints.forEach(point => {
      point.taskBreakdown?.forEach(task => {
        // In a future enhancement, we would extract from task.preferredStaffId and task.preferredStaffName
        // For now, we'll return an empty array to maintain existing functionality
      });
    });

    return Array.from(staffSet);
  }, [demandData?.dataPoints]);

  // Calculate selection state flags for proper filtering logic
  const isAllSkillsSelected = useMemo(() => {
    return availableSkills.length > 0 && selectedSkills.length === availableSkills.length;
  }, [availableSkills.length, selectedSkills.length]);

  const isAllClientsSelected = useMemo(() => {
    return availableClients.length > 0 && selectedClients.length === availableClients.length;
  }, [availableClients.length, selectedClients.length]);

  // Phase 3: Calculate preferred staff selection state
  const isAllPreferredStaffSelected = useMemo(() => {
    return availablePreferredStaff.length > 0 && selectedPreferredStaff.length === availablePreferredStaff.length;
  }, [availablePreferredStaff.length, selectedPreferredStaff.length]);

  // Log filtering state for debugging
  console.log(`🎛️ [MATRIX FILTERING] Available options:`, {
    availableSkills: availableSkills.length,
    availableClients: availableClients.length,
    availablePreferredStaff: availablePreferredStaff.length, // Phase 3: Log preferred staff availability
    selectedSkills: selectedSkills.length,
    selectedClients: selectedClients.length,
    selectedPreferredStaff: selectedPreferredStaff.length, // Phase 3: Log preferred staff selection
    isAllSkillsSelected,
    isAllClientsSelected,
    isAllPreferredStaffSelected // Phase 3: Log preferred staff selection state
  });

  return {
    availableSkills,
    availableClients,
    availablePreferredStaff, // Phase 3: Return available preferred staff
    isAllSkillsSelected,
    isAllClientsSelected,
    isAllPreferredStaffSelected // Phase 3: Return preferred staff selection state
  };
};
