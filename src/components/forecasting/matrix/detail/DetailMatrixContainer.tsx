
import React from 'react';
import { useDetailMatrixData } from './hooks/useDetailMatrixData';
import { useDetailMatrixFilters } from './hooks/useDetailMatrixFilters';
import { useStaffForecastSummary } from './hooks/useStaffForecastSummary';
import { useDemandMatrixData } from '../hooks/useDemandMatrixData';
import { DetailMatrixView } from './DetailMatrixView';
import { StaffForecastSummaryView } from './StaffForecastSummaryView';
import { DetailMatrixPresentation } from '@/features/detail-matrix/components/DetailMatrixPresentation';

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
  const { data: matrixData, months, loading: isMatrixLoading, error, demandMatrixControls } = useDetailMatrixData({ groupingMode });
  const tasks = matrixData || [];

  // No longer need separate useMatrixFiltering call - it's integrated into demandMatrixControls

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

  // Handle loading state when data is not yet available
  if (isMatrixLoading && !matrixData) {
    return (
      <DetailMatrixPresentation
        demandMatrixControls={demandMatrixControls}
        isLoading={true}
        error={null}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading detail matrix data...</div>
        </div>
      </DetailMatrixPresentation>
    );
  }

  // Handle error state
  if (error) {
    return (
      <DetailMatrixPresentation
        demandMatrixControls={demandMatrixControls}
        isLoading={false}
        error={error}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-destructive">Error loading data: {error}</div>
        </div>
      </DetailMatrixPresentation>
    );
  }

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
    <DetailMatrixPresentation
      demandMatrixControls={demandMatrixControls}
      isLoading={isMatrixLoading}
      error={error}
    >
      <DetailMatrixView
        data={filterResult.filteredTasks || []}
        months={months}
        isLoading={isMatrixLoading}
        groupingMode={groupingMode}
      />
    </DetailMatrixPresentation>
  );
};
