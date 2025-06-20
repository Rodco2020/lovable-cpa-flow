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
}

/**
 * Phase 1: Enhanced Demand Matrix Filtering Hook - Fixed "All Preferred Staff" Logic
 * 
 * PHASE 1 FIXES:
 * - When all preferred staff are selected: show ALL tasks (both with and without preferred staff)
 * - When specific staff are selected: show only tasks assigned to those specific staff
 * - Maintains backward compatibility with existing skill and client filtering
 * - Enhanced logging for debugging and validation
 */
export const useDemandMatrixFiltering = ({
  demandData,
  selectedSkills,
  selectedClients,
  selectedPreferredStaff,
  monthRange,
  isAllSkillsSelected,
  isAllClientsSelected,
  isAllPreferredStaffSelected
}: UseDemandMatrixFilteringProps) => {

  const filteredData = useMemo(() => {
    if (!demandData) {
      console.log('🔍 [MATRIX FILTERING] Phase 1 - No demand data available');
      return null;
    }

    console.log('🔍 [MATRIX FILTERING] Phase 1 - Starting filtering with FIXED All Preferred Staff logic:', {
      originalDataPoints: demandData.dataPoints.length,
      monthRange,
      skillsFilter: isAllSkillsSelected ? 'ALL' : selectedSkills.length,
      clientsFilter: isAllClientsSelected ? 'ALL' : selectedClients.length,
      preferredStaffFilter: isAllPreferredStaffSelected ? 'ALL' : selectedPreferredStaff.length,
      filteringMode: isAllPreferredStaffSelected ? 'SHOW_ALL_TASKS_FIXED' : 'FILTER_BY_PREFERRED_STAFF'
    });

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

      // PHASE 1 FIX: Enhanced Preferred Staff Filtering Logic
      if (isAllPreferredStaffSelected) {
        // FIXED: When "All Preferred Staff" is selected, show ALL tasks
        // This includes tasks WITH preferred staff AND tasks WITHOUT preferred staff
        // NO FILTERING is applied - keep all tasks
        console.log(`🌟 [MATRIX FILTERING] Phase 1 FIXED - Showing ALL tasks (All Preferred Staff mode):`, {
          month: point.month,
          skill: point.skillType,
          totalTasks: filteredTaskBreakdown.length,
          tasksWithPreferredStaff: filteredTaskBreakdown.filter(t => t.preferredStaff?.staffId).length,
          tasksWithoutPreferredStaff: filteredTaskBreakdown.filter(t => !t.preferredStaff?.staffId).length,
          fixApplied: 'NO_PREFERRED_STAFF_FILTERING'
        });
      } else {
        // When specific preferred staff are selected, show only tasks assigned to those staff
        const originalTaskCount = filteredTaskBreakdown.length;
        
        filteredTaskBreakdown = filteredTaskBreakdown.filter(task => {
          const taskPreferredStaffId = task.preferredStaff?.staffId;
          
          // Include task if it has a preferred staff ID that matches our selection
          if (taskPreferredStaffId && selectedPreferredStaff.includes(taskPreferredStaffId)) {
            return true;
          }
          
          // Exclude tasks that don't match our preferred staff filter
          return false;
        });
        
        console.log(`🎯 [MATRIX FILTERING] Phase 1 - Filtered by specific preferred staff:`, {
          month: point.month,
          skill: point.skillType,
          originalTasks: originalTaskCount,
          filteredTasks: filteredTaskBreakdown.length,
          selectedStaff: selectedPreferredStaff.length,
          filterApplied: 'SPECIFIC_PREFERRED_STAFF_ONLY'
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

    console.log('✅ [MATRIX FILTERING] Phase 1 FIXED - Filtering completed:', {
      originalDataPoints: demandData.dataPoints.length,
      filteredDataPoints: result.dataPoints.length,
      pointsRemovedDueToNoTasks: originalFilteredPointsCount - result.dataPoints.length,
      monthsIncluded: filteredMonths.length,
      preferredStaffBehavior: isAllPreferredStaffSelected ? 'ALL_TASKS_SHOWN_FIXED' : 'FILTERED_BY_STAFF',
      totalDemandHours: result.dataPoints.reduce((sum, point) => sum + point.demandHours, 0),
      phase1FixApplied: true
    });

    // Phase 1 validation logging
    if (isAllPreferredStaffSelected) {
      const totalTasksWithPreferredStaff = result.dataPoints.reduce(
        (sum, point) => sum + point.taskBreakdown.filter(t => t.preferredStaff?.staffId).length, 0
      );
      const totalTasksWithoutPreferredStaff = result.dataPoints.reduce(
        (sum, point) => sum + point.taskBreakdown.filter(t => !t.preferredStaff?.staffId).length, 0
      );
      
      console.log('🎉 [MATRIX FILTERING] Phase 1 SUCCESS METRICS:', {
        allTasksDisplayed: true,
        tasksWithPreferredStaff: totalTasksWithPreferredStaff,
        tasksWithoutPreferredStaff: totalTasksWithoutPreferredStaff,
        totalTasksShown: totalTasksWithPreferredStaff + totalTasksWithoutPreferredStaff,
        fixValidation: 'BOTH_TASK_TYPES_INCLUDED'
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
    isAllPreferredStaffSelected
  ]);

  return filteredData;
};
