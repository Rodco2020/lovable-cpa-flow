
import { useMemo } from 'react';
import { DemandMatrixData } from '@/types/demand';

export interface UseDemandMatrixFilteringProps {
  demandData?: DemandMatrixData | null;
  selectedSkills: string[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  monthRange: { start: number; end: number };
  groupingMode: 'skill' | 'client';
}

export interface FilteredDataResult {
  data: DemandMatrixData | null;
}

export interface UseDemandMatrixFilteringResult {
  getFilteredData: () => DemandMatrixData | null;
}

/**
 * FIXED: Enhanced filtering hook that properly handles resolved skill and client names
 */
export const useDemandMatrixFiltering = (props: UseDemandMatrixFilteringProps): UseDemandMatrixFilteringResult => {
  const { demandData, selectedSkills, selectedClients, selectedPreferredStaff, monthRange, groupingMode } = props;

  const getFilteredData = useMemo(() => {
    return (): DemandMatrixData | null => {
      if (!demandData) {
        console.log('🔍 [DEMAND MATRIX FILTERING] No demand data available for filtering');
        return null;
      }

      console.log('🔍 [DEMAND MATRIX FILTERING] Starting filtering process:', {
        originalDataPoints: demandData.dataPoints.length,
        selectedSkills: selectedSkills.length,
        selectedClients: selectedClients.length,
        selectedPreferredStaff: selectedPreferredStaff.length,
        monthRange,
        groupingMode
      });

      // Apply filters to the data
      let filteredDataPoints = demandData.dataPoints;

      // FIXED: Filter by skills (these are now resolved display names)
      if (selectedSkills.length > 0) {
        const beforeSkillFilter = filteredDataPoints.length;
        filteredDataPoints = filteredDataPoints.filter(dp => {
          const matches = selectedSkills.includes(dp.skillType);
          if (matches) {
            console.log(`✅ [SKILL FILTER] Included data point for skill: ${dp.skillType}`);
          }
          return matches;
        });
        console.log(`🎯 [SKILL FILTER] Filtered ${beforeSkillFilter} -> ${filteredDataPoints.length} data points`);
      }

      // FIXED: Filter by clients (using resolved client names from task breakdowns)
      if (selectedClients.length > 0) {
        const beforeClientFilter = filteredDataPoints.length;
        filteredDataPoints = filteredDataPoints.filter(dp => {
          const hasMatchingClient = dp.taskBreakdown.some(task => {
            // Check if any selected client ID matches the task's client ID
            const matches = selectedClients.includes(task.clientId);
            if (matches) {
              console.log(`✅ [CLIENT FILTER] Included task for client: ${task.clientName} (${task.clientId})`);
            }
            return matches;
          });
          return hasMatchingClient;
        });
        console.log(`🎯 [CLIENT FILTER] Filtered ${beforeClientFilter} -> ${filteredDataPoints.length} data points`);
      }

      // Filter by preferred staff
      if (selectedPreferredStaff.length > 0) {
        const beforeStaffFilter = filteredDataPoints.length;
        filteredDataPoints = filteredDataPoints.filter(dp => {
          const hasMatchingStaff = dp.taskBreakdown.some(task => 
            task.preferredStaffId && selectedPreferredStaff.includes(task.preferredStaffId)
          );
          return hasMatchingStaff;
        });
        console.log(`🎯 [STAFF FILTER] Filtered ${beforeStaffFilter} -> ${filteredDataPoints.length} data points`);
      }

      // Filter by month range
      const filteredMonths = demandData.months.slice(monthRange.start, monthRange.end + 1);
      const monthKeys = filteredMonths.map(m => m.key);
      const beforeMonthFilter = filteredDataPoints.length;
      filteredDataPoints = filteredDataPoints.filter(dp => monthKeys.includes(dp.month));
      console.log(`🎯 [MONTH FILTER] Filtered ${beforeMonthFilter} -> ${filteredDataPoints.length} data points`);

      // Recalculate totals for filtered data
      const totalDemand = filteredDataPoints.reduce((sum, dp) => sum + dp.demandHours, 0);
      const totalTasks = filteredDataPoints.reduce((sum, dp) => sum + dp.taskCount, 0);
      const uniqueClientIds = new Set(
        filteredDataPoints.flatMap(dp => 
          dp.taskBreakdown.map(task => task.clientId)
        )
      );

      const result = {
        ...demandData,
        months: filteredMonths,
        dataPoints: filteredDataPoints,
        totalDemand,
        totalTasks,
        totalClients: uniqueClientIds.size
      };

      console.log('✅ [DEMAND MATRIX FILTERING] Filtering complete:', {
        originalDataPoints: demandData.dataPoints.length,
        filteredDataPoints: result.dataPoints.length,
        totalDemand: result.totalDemand,
        totalTasks: result.totalTasks,
        totalClients: result.totalClients,
        filterEfficiency: `${((result.dataPoints.length / demandData.dataPoints.length) * 100).toFixed(1)}%`
      });

      return result;
    };
  }, [demandData, selectedSkills, selectedClients, selectedPreferredStaff, monthRange, groupingMode]);

  return {
    getFilteredData
  };
};
