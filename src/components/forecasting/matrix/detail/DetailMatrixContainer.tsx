
import React from 'react';
import { useDetailMatrixData } from './hooks/useDetailMatrixData';
import { useDetailMatrixFilters } from './hooks/useDetailMatrixFilters';
import { useStaffForecastSummary } from './hooks/useStaffForecastSummary';
import { DetailMatrixView } from './DetailMatrixView';
import { StaffForecastSummaryView } from './StaffForecastSummaryView';

interface DetailMatrixContainerProps {
  groupingMode: 'skill' | 'client';
  viewMode: 'all-tasks' | 'group-by-skill' | 'detail-forecast-matrix' | 'staff-forecast-summary';
}

export const DetailMatrixContainer: React.FC<DetailMatrixContainerProps> = ({
  groupingMode,
  viewMode
}) => {
  // For now, use default filters until we integrate with the parent component properly
  const selectedSkills: string[] = [];
  const selectedClients: string[] = [];
  const selectedPreferredStaff: (string | number | null | undefined)[] = [];
  const monthRange = { start: 0, end: 11 };

  // Get matrix data and months
  const { data: matrixData, months, loading: isMatrixLoading } = useDetailMatrixData({ groupingMode });
  const tasks = matrixData || [];

  // Apply filters to tasks (for matrix view)
  const filterResult = useDetailMatrixFilters({
    tasks,
    selectedSkills,
    selectedClients,
    selectedPreferredStaff,
    monthRange,
    groupingMode,
    months
  });

  // Get staff forecast summary data (fetches raw tasks directly)
  const staffSummary = useStaffForecastSummary({
    months,
    selectedSkills,
    selectedClients,
    selectedPreferredStaff,
    enabled: viewMode === 'staff-forecast-summary'
  });

  // Show appropriate view based on viewMode
  if (viewMode === 'staff-forecast-summary') {
    return (
      <StaffForecastSummaryView
        utilizationData={staffSummary.utilizationData}
        months={months}
        isLoading={staffSummary.isLoading}
        error={staffSummary.error}
        firmTotals={staffSummary.firmTotals}
        filterStats={{
          activeFiltersCount: [
            selectedSkills.length,
            selectedClients.length,
            selectedPreferredStaff.filter(Boolean).length
          ].filter(count => count > 0).length,
          hasActiveFilters: selectedSkills.length > 0 || 
                          selectedClients.length > 0 || 
                          selectedPreferredStaff.filter(Boolean).length > 0
        }}
      />
    );
  }

  return (
    <DetailMatrixView
      data={filterResult.filteredTasks || []}
      months={months}
      isLoading={isMatrixLoading}
      groupingMode={groupingMode}
    />
  );
};
