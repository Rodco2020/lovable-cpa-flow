
import React from 'react';
import { useDetailMatrixData } from './hooks/useDetailMatrixData';
import { useDetailMatrixFilters } from './hooks/useDetailMatrixFilters';
import { useStaffForecastSummary } from './hooks/useStaffForecastSummary';
import { useMatrixFiltering } from '../hooks/useMatrixFiltering';
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

  // Get raw demand data for matrix filtering (to extract available options)
  const { demandData } = useDemandMatrixData(groupingMode, {});

  // PHASE 4: Add debug logging for initialization tracking
  if (!demandMatrixControls || !demandMatrixControls.selectedPreferredStaff) {
    console.warn('DetailMatrix: demandMatrixControls not fully initialized', {
      controls: demandMatrixControls,
      selectedPreferredStaff: demandMatrixControls?.selectedPreferredStaff
    });
  }

  // PHASE 3: Extract available options with comprehensive safety checks
  const matrixFiltering = demandData && demandMatrixControls ? useMatrixFiltering({
    demandData,
    selectedSkills: demandMatrixControls.selectedSkills || [],
    selectedClients: demandMatrixControls.selectedClients || [],
    selectedPreferredStaff: demandMatrixControls.selectedPreferredStaff || [],
    monthRange: demandMatrixControls.monthRange || { start: 0, end: 11 },
    groupingMode
  }) : {
    availableSkills: [],
    availableClients: [],
    availablePreferredStaff: [],
    isAllSkillsSelected: false,
    isAllClientsSelected: false,
    isAllPreferredStaffSelected: false,
  };

  // Enhance controls with extracted data from matrix filtering
  const enhancedDemandMatrixControls = {
    ...demandMatrixControls,
    // Override with extracted available options
    availableSkills: matrixFiltering.availableSkills,
    availableClients: matrixFiltering.availableClients,
    availablePreferredStaff: matrixFiltering.availablePreferredStaff,
    // Update selection flags
    isAllSkillsSelected: matrixFiltering.isAllSkillsSelected,
    isAllClientsSelected: matrixFiltering.isAllClientsSelected,
    isAllPreferredStaffSelected: matrixFiltering.isAllPreferredStaffSelected,
  };

  // Debug logging to verify the fix
  console.log('Detail Matrix Controls Enhanced:', {
    availableSkills: enhancedDemandMatrixControls.availableSkills.length,
    availableClients: enhancedDemandMatrixControls.availableClients.length,
    availablePreferredStaff: enhancedDemandMatrixControls.availablePreferredStaff.length,
    selectedSkills: enhancedDemandMatrixControls.selectedSkills.length,
    selectedClients: enhancedDemandMatrixControls.selectedClients.length,
    selectedPreferredStaff: enhancedDemandMatrixControls.selectedPreferredStaff.length,
  });

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
      demandMatrixControls={enhancedDemandMatrixControls}
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
