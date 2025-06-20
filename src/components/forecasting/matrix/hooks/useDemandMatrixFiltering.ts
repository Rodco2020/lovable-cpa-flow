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
 * Phase 2: Enhanced Demand Matrix Filtering Hook
 * 
 * Implements proper "All Preferred Staff" behavior:
 * - When all preferred staff are selected: show ALL tasks (both with and without preferred staff)
 * - When specific staff are selected: show only tasks assigned to those specific staff
 * - Maintains backward compatibility with existing skill and client filtering
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
      console.log('🔍 [MATRIX FILTERING] Phase 2 - No demand data available');
      return null;
    }

    console.log('🔍 [MATRIX FILTERING] Phase 2 - Starting filtering with enhanced preferred staff logic:', {
      originalDataPoints: demandData.dataPoints.length,
      monthRange,
      skillsFilter: isAllSkillsSelected ? 'ALL' : selectedSkills.length,
      clientsFilter: isAllClientsSelected ? 'ALL' : selectedClients.length,
      preferredStaffFilter: isAllPreferredStaffSelected ? 'ALL' : selectedPreferredStaff.length,
      filteringMode: isAllPreferredStaffSelected ? 'SHOW_ALL_TASKS' : 'FILTER_BY_PREFERRED_STAFF'
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

      // Phase 2: Enhanced Preferred Staff Filtering Logic
      if (!isAllPreferredStaffSelected) {
        // When specific preferred staff are selected, show only tasks assigned to those staff
        filteredTaskBreakdown = filteredTaskBreakdown.filter(task => {
          const taskPreferredStaffId = task.preferredStaff?.staffId;
          
          // Include task if it has a preferred staff ID that matches our selection
          if (taskPreferredStaffId && selectedPreferredStaff.includes(taskPreferredStaffId)) {
            return true;
          }
          
          // Exclude tasks that don't match our preferred staff filter
          return false;
        });
        
        console.log(`🎯 [MATRIX FILTERING] Phase 2 - Filtered by specific preferred staff:`, {
          month: point.month,
          skill: point.skillType,
          originalTasks: point.taskBreakdown.length,
          filteredTasks: filteredTaskBreakdown.length,
          selectedStaff: selectedPreferredStaff.length
        });
      } else {
        // When "All Preferred Staff" is selected, show ALL tasks (both with and without preferred staff)
        // No additional filtering needed - keep all tasks
        console.log(`🌟 [MATRIX FILTERING] Phase 2 - Showing all tasks (All Preferred Staff mode):`, {
          month: point.month,
          skill: point.skillType,
          totalTasks: filteredTaskBreakdown.length,
          tasksWithPreferredStaff: filteredTaskBreakdown.filter(t => t.preferredStaff?.staffId).length,
          tasksWithoutPreferredStaff: filteredTaskBreakdown.filter(t => !t.preferredStaff?.staffId).length
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
    filteredDataPoints = filteredDataPoints.filter(point => point.taskCount > 0);

    const result = {
      ...demandData,
      months: filteredMonths,
      dataPoints: filteredDataPoints
    };

    console.log('✅ [MATRIX FILTERING] Phase 2 - Filtering completed:', {
      originalDataPoints: demandData.dataPoints.length,
      filteredDataPoints: result.dataPoints.length,
      monthsIncluded: filteredMonths.length,
      preferredStaffBehavior: isAllPreferredStaffSelected ? 'ALL_TASKS_SHOWN' : 'FILTERED_BY_STAFF',
      totalDemandHours: result.dataPoints.reduce((sum, point) => sum + point.demandHours, 0)
    });

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
