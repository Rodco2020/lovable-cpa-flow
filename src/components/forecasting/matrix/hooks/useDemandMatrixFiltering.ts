import { useMemo } from 'react';
import { DemandMatrixData } from '@/types/demand';

interface UseDemandMatrixFilteringProps {
  demandData?: DemandMatrixData | null;
  selectedSkills: string[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  monthRange: { start: number; end: number };
  isAllSkillsSelected: boolean;
  isAllClientsSelected: boolean;
  isAllPreferredStaffSelected: boolean;
  preferredStaffFilterMode: 'all' | 'specific' | 'none'; // Phase 2: New three-mode system
}

/**
 * Phase 2: Enhanced Demand Matrix Filtering Hook - Three-Mode Preferred Staff Filtering
 * 
 * PHASE 2 ENHANCEMENTS:
 * - Supports three distinct filtering modes: 'all', 'specific', 'none'
 * - 'all' mode: Shows all tasks regardless of preferred staff assignment
 * - 'specific' mode: Shows only tasks assigned to selected preferred staff
 * - 'none' mode: Shows only tasks without preferred staff assignments
 * - Maintains backward compatibility with existing filtering logic
 * - Enhanced validation and error handling
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
}: UseDemandMatrixFilteringProps) => {

  const filteredData = useMemo(() => {
    if (!demandData) {
      console.log('🔍 [MATRIX FILTERING] Phase 2 - No demand data available');
      return null;
    }

    console.log('🔍 [MATRIX FILTERING] Phase 2 - Starting three-mode filtering:', {
      originalDataPoints: demandData.dataPoints.length,
      monthRange,
      skillsFilter: isAllSkillsSelected ? 'ALL' : selectedSkills.length,
      clientsFilter: isAllClientsSelected ? 'ALL' : selectedClients.length,
      preferredStaffFilter: isAllPreferredStaffSelected ? 'ALL' : selectedPreferredStaff.length,
      filteringMode: preferredStaffFilterMode,
      phase2Enhancement: 'THREE_MODE_SYSTEM'
    });

    // Validate filter mode
    const validModes = ['all', 'specific', 'none'];
    if (!validModes.includes(preferredStaffFilterMode)) {
      console.warn('⚠️ [MATRIX FILTERING] Phase 2 - Invalid filter mode, defaulting to "all":', preferredStaffFilterMode);
    }

    // Filter months based on range
    const filteredMonths = demandData.months.slice(monthRange.start, monthRange.end + 1);
    const selectedMonthKeys = new Set(filteredMonths.map(month => month.key));

    // Filter data points
    let filteredDataPoints = demandData.dataPoints.filter(point => {
      // Month filter
      if (!selectedMonthKeys.has(point.month)) {
        return false;
      }

      // Skill filter - use ALL if all are selected, otherwise filter by selected
      if (!isAllSkillsSelected && !selectedSkills.includes(point.skillType)) {
        return false;
      }

      return true;
    });

    // Apply client and preferred staff filtering to task breakdown within each data point
    filteredDataPoints = filteredDataPoints.map(point => {
      let filteredTaskBreakdown = point.taskBreakdown;

      // Client filtering
      if (!isAllClientsSelected) {
        filteredTaskBreakdown = filteredTaskBreakdown.filter(task => 
          selectedClients.includes(task.clientId)
        );
      }

      // PHASE 2: Enhanced Three-Mode Preferred Staff Filtering Logic
      const originalTaskCount = filteredTaskBreakdown.length;
      
      if (preferredStaffFilterMode === 'all') {
        // Mode 'all': Show ALL tasks (both with and without preferred staff)
        // NO FILTERING is applied - keep all tasks
        console.log(`🌟 [MATRIX FILTERING] Phase 2 - ALL mode: Showing all tasks:`, {
          month: point.month,
          skill: point.skillType,
          totalTasks: filteredTaskBreakdown.length,
          tasksWithPreferredStaff: filteredTaskBreakdown.filter(t => t.preferredStaff?.staffId).length,
          tasksWithoutPreferredStaff: filteredTaskBreakdown.filter(t => !t.preferredStaff?.staffId).length,
          mode: 'SHOW_ALL_TASKS'
        });
      } else if (preferredStaffFilterMode === 'specific') {
        // Mode 'specific': Show only tasks assigned to selected preferred staff
        filteredTaskBreakdown = filteredTaskBreakdown.filter(task => {
          const taskPreferredStaffId = task.preferredStaff?.staffId;
          
          // Include task if it has a preferred staff ID that matches our selection
          if (taskPreferredStaffId && selectedPreferredStaff.includes(taskPreferredStaffId)) {
            return true;
          }
          
          // Exclude tasks that don't match our preferred staff filter
          return false;
        });
        
        console.log(`🎯 [MATRIX FILTERING] Phase 2 - SPECIFIC mode: Filtered by selected preferred staff:`, {
          month: point.month,
          skill: point.skillType,
          originalTasks: originalTaskCount,
          filteredTasks: filteredTaskBreakdown.length,
          selectedStaff: selectedPreferredStaff.length,
          mode: 'FILTER_BY_PREFERRED_STAFF'
        });
      } else if (preferredStaffFilterMode === 'none') {
        // Mode 'none': Show only tasks WITHOUT preferred staff assignments
        filteredTaskBreakdown = filteredTaskBreakdown.filter(task => {
          const taskPreferredStaffId = task.preferredStaff?.staffId;
          
          // Include task if it does NOT have a preferred staff assignment
          return !taskPreferredStaffId;
        });
        
        console.log(`🚫 [MATRIX FILTERING] Phase 2 - NONE mode: Showing only unassigned tasks:`, {
          month: point.month,
          skill: point.skillType,
          originalTasks: originalTaskCount,
          filteredTasks: filteredTaskBreakdown.length,
          mode: 'UNASSIGNED_TASKS_ONLY'
        });
      }

      // Recalculate aggregated values based on filtered tasks
      const demandHours = filteredTaskBreakdown.reduce((sum, task) => sum + task.monthlyHours, 0);
      const taskCount = filteredTaskBreakdown.length;
      
      // Count unique clients in filtered tasks
      const uniqueClients = new Set(filteredTaskBreakdown.map(task => task.clientId));
      const clientCount = uniqueClients.size;

      return {
        ...point,
        taskBreakdown: filteredTaskBreakdown,
        demandHours,
        taskCount,
        clientCount
      };
    });

    // Filter out data points with no remaining tasks after filtering
    const originalFilteredPointsCount = filteredDataPoints.length;
    filteredDataPoints = filteredDataPoints.filter(point => point.taskCount > 0);

    const result = {
      ...demandData,
      months: filteredMonths,
      dataPoints: filteredDataPoints
    };

    console.log('✅ [MATRIX FILTERING] Phase 2 - Three-mode filtering completed:', {
      originalDataPoints: demandData.dataPoints.length,
      filteredDataPoints: result.dataPoints.length,
      pointsRemovedDueToNoTasks: originalFilteredPointsCount - result.dataPoints.length,
      monthsIncluded: filteredMonths.length,
      preferredStaffMode: preferredStaffFilterMode,
      totalDemandHours: result.dataPoints.reduce((sum, point) => sum + point.demandHours, 0),
      phase2Enhancement: 'THREE_MODE_FILTERING_COMPLETE'
    });

    // Phase 2 validation logging for each mode
    if (preferredStaffFilterMode === 'all') {
      const totalTasksWithPreferredStaff = result.dataPoints.reduce(
        (sum, point) => sum + point.taskBreakdown.filter(t => t.preferredStaff?.staffId).length, 0
      );
      const totalTasksWithoutPreferredStaff = result.dataPoints.reduce(
        (sum, point) => sum + point.taskBreakdown.filter(t => !t.preferredStaff?.staffId).length, 0
      );
      
      console.log('🎉 [MATRIX FILTERING] Phase 2 ALL MODE METRICS:', {
        mode: 'all',
        allTasksDisplayed: true,
        tasksWithPreferredStaff: totalTasksWithPreferredStaff,
        tasksWithoutPreferredStaff: totalTasksWithoutPreferredStaff,
        totalTasksShown: totalTasksWithPreferredStaff + totalTasksWithoutPreferredStaff,
        validation: 'BOTH_TASK_TYPES_INCLUDED'
      });
    } else if (preferredStaffFilterMode === 'specific') {
      const totalTasksShown = result.dataPoints.reduce(
        (sum, point) => sum + point.taskBreakdown.length, 0
      );
      
      console.log('🎉 [MATRIX FILTERING] Phase 2 SPECIFIC MODE METRICS:', {
        mode: 'specific',
        selectedStaffCount: selectedPreferredStaff.length,
        totalTasksShown,
        validation: 'ONLY_SELECTED_STAFF_TASKS'
      });
    } else if (preferredStaffFilterMode === 'none') {
      const totalUnassignedTasks = result.dataPoints.reduce(
        (sum, point) => sum + point.taskBreakdown.length, 0
      );
      
      console.log('🎉 [MATRIX FILTERING] Phase 2 NONE MODE METRICS:', {
        mode: 'none',
        totalUnassignedTasks,
        validation: 'ONLY_UNASSIGNED_TASKS'
      });
    }

    return result;
  }, [
    demandData,
    selectedSkills,
    selectedClients,
    selectedPreferredStaff,
    monthRange,
    isAllSkillsSelected,
    isAllClientsSelected,
    isAllPreferredStaffSelected,
    preferredStaffFilterMode // Phase 2: Include new filter mode in dependencies
  ]);

  return filteredData;
};
