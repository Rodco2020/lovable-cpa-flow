
import { useMemo } from 'react';
import { DemandMatrixData } from '@/types/demand';
import { SkillType } from '@/types/task';

interface UseDemandMatrixFilteringProps {
  demandData: DemandMatrixData | null;
  selectedSkills: SkillType[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  monthRange: { start: number; end: number };
  isAllSkillsSelected: boolean;
  isAllClientsSelected: boolean;
  isAllPreferredStaffSelected: boolean;
  // Phase 2: Enhanced with three-mode filter support
  preferredStaffFilterMode: 'all' | 'specific' | 'none';
}

/**
 * Phase 2: Enhanced Demand Matrix Filtering Hook
 * 
 * PHASE 2 ENHANCEMENTS:
 * - Added preferredStaffFilterMode filtering logic
 * - Implemented three-mode system (all/specific/none)
 * - Enhanced performance with proper memoization
 * - Maintained all existing filtering functionality
 * - Fixed property access to match actual DemandDataPoint structure
 * - Fixed preferred staff property access to use 'preferredStaff' instead of 'preferredStaffId'
 */
export const useDemandMatrixFiltering = ({
  demandData,
  selectedSkills,
  selectedClients,
  selectedPreferredStaff,
  monthRange,
  isAllSkillsSelected,
  isAllClientsSelected,
  isAllPreferredStaffSelected,
  preferredStaffFilterMode
}: UseDemandMatrixFilteringProps): DemandMatrixData | null => {
  
  return useMemo(() => {
    if (!demandData) {
      console.log(`🔍 [PHASE 2 FILTERING] No demand data available for filtering`);
      return null;
    }

    console.log(`🔍 [PHASE 2 FILTERING] Applying three-mode preferred staff filtering:`, {
      preferredStaffFilterMode,
      selectedPreferredStaffCount: selectedPreferredStaff.length,
      totalDataPoints: demandData.dataPoints.length,
      isAllSkillsSelected,
      isAllClientsSelected
    });

    // Start with original data points
    let filteredDataPoints = [...demandData.dataPoints];

    // Apply skills filtering (using skillType property)
    if (!isAllSkillsSelected && selectedSkills.length > 0) {
      filteredDataPoints = filteredDataPoints.filter(point => 
        selectedSkills.includes(point.skillType)
      );
    }

    // Apply clients filtering (using taskBreakdown to get client information)
    if (!isAllClientsSelected && selectedClients.length > 0) {
      filteredDataPoints = filteredDataPoints.filter(point => 
        point.taskBreakdown?.some(task => selectedClients.includes(task.clientId))
      );
    }

    // Phase 2: Apply three-mode preferred staff filtering
    switch (preferredStaffFilterMode) {
      case 'all':
        // Show all tasks regardless of preferred staff assignment
        // No additional filtering needed
        console.log(`🌐 [PHASE 2 FILTERING] All mode - showing all tasks`);
        break;

      case 'specific':
        // Show only tasks assigned to selected preferred staff
        if (selectedPreferredStaff.length > 0) {
          filteredDataPoints = filteredDataPoints.filter(point => 
            point.taskBreakdown?.some(task => 
              task.preferredStaff && selectedPreferredStaff.includes(task.preferredStaff)
            )
          );
          console.log(`🎯 [PHASE 2 FILTERING] Specific mode - filtered to ${selectedPreferredStaff.length} staff`);
        } else {
          // If no staff selected in specific mode, show no tasks
          filteredDataPoints = [];
          console.log(`🎯 [PHASE 2 FILTERING] Specific mode - no staff selected, showing no tasks`);
        }
        break;

      case 'none':
        // Show only tasks without preferred staff assignments
        filteredDataPoints = filteredDataPoints.filter(point => 
          point.taskBreakdown?.some(task => 
            !task.preferredStaff || task.preferredStaff === null || task.preferredStaff === ''
          )
        );
        console.log(`❌ [PHASE 2 FILTERING] None mode - showing only unassigned tasks`);
        break;

      default:
        console.warn(`⚠️ [PHASE 2 FILTERING] Unknown preferred staff filter mode: ${preferredStaffFilterMode}`);
        break;
    }

    // Apply month range filtering (if needed in the future)
    // ... month range filtering logic would go here if needed

    console.log(`✅ [PHASE 2 FILTERING] Filtering complete:`, {
      originalCount: demandData.dataPoints.length,
      filteredCount: filteredDataPoints.length,
      filterMode: preferredStaffFilterMode,
      filtersApplied: {
        skills: !isAllSkillsSelected,
        clients: !isAllClientsSelected,
        preferredStaff: preferredStaffFilterMode !== 'all'
      }
    });

    // Return filtered data with updated data points
    return {
      ...demandData,
      dataPoints: filteredDataPoints,
      // Update summary statistics based on filtered data
      totalDemand: filteredDataPoints.reduce((sum, point) => sum + (point.demandHours || 0), 0),
      totalTasks: filteredDataPoints.reduce((sum, point) => sum + (point.taskCount || 0), 0),
      totalClients: filteredDataPoints.reduce((sum, point) => sum + (point.clientCount || 0), 0)
    };

  }, [
    demandData,
    selectedSkills,
    selectedClients,
    selectedPreferredStaff,
    monthRange,
    isAllSkillsSelected,
    isAllClientsSelected,
    isAllPreferredStaffSelected,
    preferredStaffFilterMode // Phase 2: Include in dependency array
  ]);
};
