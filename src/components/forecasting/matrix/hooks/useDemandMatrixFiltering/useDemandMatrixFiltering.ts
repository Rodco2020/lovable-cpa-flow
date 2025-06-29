
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

export const useDemandMatrixFiltering = (props: UseDemandMatrixFilteringProps): UseDemandMatrixFilteringResult => {
  const { demandData, selectedSkills, selectedClients, selectedPreferredStaff, monthRange, groupingMode } = props;

  const getFilteredData = useMemo(() => {
    return (): DemandMatrixData | null => {
      if (!demandData) {
        return null;
      }

      // Apply filters to the data
      let filteredDataPoints = demandData.dataPoints;

      // Filter by skills
      if (selectedSkills.length > 0) {
        filteredDataPoints = filteredDataPoints.filter(dp => 
          selectedSkills.includes(dp.skillType)
        );
      }

      // Filter by clients
      if (selectedClients.length > 0) {
        filteredDataPoints = filteredDataPoints.filter(dp => 
          dp.taskBreakdown.some(task => selectedClients.includes(task.clientId))
        );
      }

      // Filter by preferred staff
      if (selectedPreferredStaff.length > 0) {
        filteredDataPoints = filteredDataPoints.filter(dp => 
          dp.taskBreakdown.some(task => 
            task.preferredStaffId && selectedPreferredStaff.includes(task.preferredStaffId)
          )
        );
      }

      // Filter by month range
      const filteredMonths = demandData.months.slice(monthRange.start, monthRange.end + 1);
      const monthKeys = filteredMonths.map(m => m.key);
      filteredDataPoints = filteredDataPoints.filter(dp => monthKeys.includes(dp.month));

      return {
        ...demandData,
        months: filteredMonths,
        dataPoints: filteredDataPoints,
        totalDemand: filteredDataPoints.reduce((sum, dp) => sum + dp.demandHours, 0),
        totalTasks: filteredDataPoints.reduce((sum, dp) => sum + dp.taskCount, 0)
      };
    };
  }, [demandData, selectedSkills, selectedClients, selectedPreferredStaff, monthRange, groupingMode]);

  return {
    getFilteredData
  };
};
