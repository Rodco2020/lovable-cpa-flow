
import React from 'react';
import { useDetailMatrixData } from './hooks/useDetailMatrixData';
import { useDetailMatrixFilters } from './hooks/useDetailMatrixFilters';
import { useStaffForecastSummary } from './hooks/useStaffForecastSummary';
import { DetailMatrixView } from './DetailMatrixView';
import { StaffForecastSummaryView } from './StaffForecastSummaryView';

interface DetailMatrixContainerProps {
  filters: {
    selectedSkills: string[];
    selectedClients: string[];
    selectedPreferredStaff: (string | number | null | undefined)[];
    monthRange: { start: number; end: number };
    groupingMode: 'skill' | 'client';
  };
  activeView: 'matrix' | 'staff-summary';
}

export const DetailMatrixContainer: React.FC<DetailMatrixContainerProps> = ({
  filters,
  activeView
}) => {
  const {
    selectedSkills,
    selectedClients,
    selectedPreferredStaff,
    monthRange,
    groupingMode
  } = filters;

  // Get matrix data and months
  const { data: matrixData, months, isLoading: isMatrixLoading } = useDetailMatrixData();
  const { tasks } = matrixData || { tasks: [] };

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
    enabled: activeView === 'staff-summary'
  });

  // Show appropriate view based on activeView
  if (activeView === 'staff-summary') {
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
      data={filterResult}
      months={months}
      isLoading={isMatrixLoading}
      groupingMode={groupingMode}
    />
  );
};
