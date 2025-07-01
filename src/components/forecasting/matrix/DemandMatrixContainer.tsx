
import React, { useEffect, useMemo } from 'react';
import { useDemandMatrixControls } from './hooks/useDemandMatrixControls';
import { useDemandMatrixRealtime } from '@/hooks/useDemandMatrixRealtime';
import { useDemandMatrixState } from './DemandMatrixStateProvider';
import { DemandMatrixPresentation } from './DemandMatrixPresentation';
import { useDemandMatrixData } from './hooks/useDemandMatrixData';
import { useDemandMatrixFiltering } from './hooks/useDemandMatrixFiltering';
import { useDemandMatrixHandlers } from './hooks/useDemandMatrixHandlers';
import { useMatrixFiltering } from './hooks/useMatrixFiltering';
import { createCloseHandlers, isComponentLoading } from './utils/demandMatrixUtils';

interface DemandMatrixContainerProps {
  className?: string;
  groupingMode: 'skill' | 'client';
}

/**
 * FIXED: Container component with proper data flow and filter integration
 */
export const DemandMatrixContainer: React.FC<DemandMatrixContainerProps> = ({
  className,
  groupingMode
}) => {
  const {
    validationIssues,
    isControlsExpanded,
    drillDownData,
    selectedDrillDown,
    showExportDialog,
    showPrintExportDialog,
    timeHorizon,
    customDateRange,
    setIsControlsExpanded,
    setDrillDownData,
    setSelectedDrillDown,
    setShowExportDialog,
    setShowPrintExportDialog,
  } = useDemandMatrixState();

  // Controls for filtering
  const demandMatrixControls = useDemandMatrixControls({
    demandData: null, // Will be populated after data loading
    groupingMode
  });

  console.log(`🔍 [FIXED CONTAINER] ========= CONTAINER RENDER =========`);
  console.log(`🔍 [FIXED CONTAINER] Controls state:`, {
    selectedSkills: demandMatrixControls.selectedSkills,
    selectedClients: demandMatrixControls.selectedClients,
    selectedPreferredStaff: demandMatrixControls.selectedPreferredStaff,
    monthRange: demandMatrixControls.monthRange,
    groupingMode
  });

  // FIXED: Stabilize activeFilters to prevent infinite loops
  const activeFilters = useMemo(() => ({
    preferredStaff: demandMatrixControls.selectedPreferredStaff,
    skills: demandMatrixControls.selectedSkills,
    clients: demandMatrixControls.selectedClients
  }), [
    JSON.stringify(demandMatrixControls.selectedPreferredStaff),
    JSON.stringify(demandMatrixControls.selectedSkills),
    JSON.stringify(demandMatrixControls.selectedClients)
  ]);

  console.log(`🎯 [FIXED CONTAINER] Stable active filters prepared:`, {
    activeFilters,
    hasPreferredStaffFilter: !!(activeFilters.preferredStaff && activeFilters.preferredStaff.length > 0),
    preferredStaffCount: activeFilters.preferredStaff?.length || 0,
    skillsCount: activeFilters.skills?.length || 0,
    clientsCount: activeFilters.clients?.length || 0
  });

  // FIXED: Data loading with stabilized filters
  const { demandData, isLoading, error, loadDemandData, handleRetryWithBackoff } = useDemandMatrixData(
    groupingMode, 
    activeFilters
  );

  // FIXED: Extract available options from the loaded demand data
  const matrixFiltering = useMatrixFiltering({
    demandData,
    selectedSkills: demandMatrixControls.selectedSkills,
    selectedClients: demandMatrixControls.selectedClients,
    selectedPreferredStaff: demandMatrixControls.selectedPreferredStaff,
    monthRange: demandMatrixControls.monthRange,
    groupingMode
  });

  // Log matrix filtering results
  useEffect(() => {
    console.log(`🎛️ [FIXED CONTAINER] Matrix filtering results:`, {
      availableSkills: matrixFiltering.availableSkills.length,
      availableClients: matrixFiltering.availableClients.length,
      availablePreferredStaff: matrixFiltering.availablePreferredStaff.length,
      validationErrors: matrixFiltering.validationErrors
    });
  }, [matrixFiltering]);

  // Log whenever demandData changes
  useEffect(() => {
    if (demandData) {
      console.log(`📊 [FIXED CONTAINER] ========= DEMAND DATA RECEIVED =========`);
      console.log(`📊 [FIXED CONTAINER] Data summary:`, {
        aggregationStrategy: demandData.aggregationStrategy,
        dataPoints: demandData.dataPoints.length,
        skills: demandData.skills.length,
        months: demandData.months.length,
        totalDemand: demandData.totalDemand,
        totalTasks: demandData.totalTasks
      });
      
      // Special focus on staff-specific data if present
      const staffSpecificDataPoints = demandData.dataPoints.filter(dp => dp.isStaffSpecific);
      
      if (staffSpecificDataPoints.length > 0) {
        console.log(`👨‍💼 [FIXED CONTAINER] STAFF-SPECIFIC DATA POINTS FOUND:`, {
          count: staffSpecificDataPoints.length,
          sampleDataPoints: staffSpecificDataPoints.slice(0, 3).map(dp => ({
            skillType: dp.skillType,
            demandHours: dp.demandHours,
            taskCount: dp.taskCount,
            actualStaffName: dp.actualStaffName,
            isStaffSpecific: dp.isStaffSpecific
          }))
        });
      }
    }
  }, [demandData]);

  // Data filtering logic with stable filters
  const { getFilteredData } = useDemandMatrixFiltering({
    demandData,
    selectedSkills: demandMatrixControls.selectedSkills,
    selectedClients: demandMatrixControls.selectedClients,
    selectedPreferredStaff: demandMatrixControls.selectedPreferredStaff,
    monthRange: demandMatrixControls.monthRange,
    groupingMode
  });

  // Event handlers
  const {
    handleCellClick,
    handleTimeHorizonChange,
    handleShowExport,
    handleShowPrintExport,
    handleCustomDateRangeChange
  } = useDemandMatrixHandlers(demandData, demandMatrixControls);

  // Real-time updates integration
  const { refreshData } = useDemandMatrixRealtime({
    onDataChange: loadDemandData,
    isEnabled: !isLoading && !error
  });

  // Create close handlers for dialogs
  const closeHandlers = createCloseHandlers({
    setDrillDownData,
    setSelectedDrillDown,
    setShowExportDialog,
    setShowPrintExportDialog,
  });

  // Get filtered data
  const filteredData = getFilteredData();

  // Log filtered data
  useEffect(() => {
    if (filteredData) {
      console.log(`🔍 [FIXED CONTAINER] ========= FILTERED DATA =========`);
      console.log(`🔍 [FIXED CONTAINER] Filtered data summary:`, {
        originalDataPoints: demandData?.dataPoints.length || 0,
        filteredDataPoints: filteredData.dataPoints.length,
        filterEfficiency: demandData ? `${((filteredData.dataPoints.length / demandData.dataPoints.length) * 100).toFixed(1)}%` : 'N/A',
        filteredSkills: filteredData.skills,
        filteredMonths: filteredData.months.map(m => m.label)
      });
    }
  }, [filteredData, demandData]);

  // Check if component is in loading state
  const componentIsLoading = isComponentLoading(
    isLoading,
    demandMatrixControls.skillsLoading,
    demandMatrixControls.clientsLoading
  );

  // FIXED: Prepare enhanced controls with proper data
  const enhancedDemandMatrixControls = {
    ...demandMatrixControls,
    // Override extracted data from matrix filtering
    availableSkills: matrixFiltering.availableSkills,
    availableClients: matrixFiltering.availableClients,
    availablePreferredStaff: matrixFiltering.availablePreferredStaff,
    isAllSkillsSelected: matrixFiltering.isAllSkillsSelected,
    isAllClientsSelected: matrixFiltering.isAllClientsSelected,
    isAllPreferredStaffSelected: matrixFiltering.isAllPreferredStaffSelected,
    // Additional loading and error states
    skillsLoading: false, // Skills are extracted from demand data
    clientsLoading: false, // Clients are extracted from demand data
    preferredStaffLoading: false, // Staff are extracted from demand data
    skillsError: null,
    clientsError: null,
    preferredStaffError: null
  };

  // Prepare all props for the presentation component
  const presentationProps = {
    className,
    groupingMode,
    demandData,
    filteredData,
    isLoading: componentIsLoading,
    error,
    validationIssues,
    isControlsExpanded,
    retryCount: 0,
    drillDownData,
    selectedDrillDown,
    showExportDialog,
    showPrintExportDialog,
    timeHorizon,
    customDateRange,
    demandMatrixControls: enhancedDemandMatrixControls,
    onToggleControls: () => setIsControlsExpanded(!isControlsExpanded),
    onRefresh: refreshData,
    onRetry: handleRetryWithBackoff,
    onCellClick: handleCellClick,
    onTimeHorizonChange: handleTimeHorizonChange,
    onCustomDateRangeChange: handleCustomDateRangeChange,
    onShowExport: handleShowExport,
    onShowPrintExport: handleShowPrintExport,
    ...closeHandlers,
  };

  return <DemandMatrixPresentation {...presentationProps} />;
};
