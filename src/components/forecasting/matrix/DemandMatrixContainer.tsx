
import React, { useEffect, useMemo } from 'react';
import { useDemandMatrixControls } from './hooks/useDemandMatrixControls';
import { useDemandMatrixRealtime } from '@/hooks/useDemandMatrixRealtime';
import { useDemandMatrixState } from './DemandMatrixStateProvider';
import { DemandMatrixPresentation } from './DemandMatrixPresentation';
import { useDemandMatrixData } from './hooks/useDemandMatrixData';
import { useDemandMatrixFiltering } from './hooks/useDemandMatrixFiltering';
import { useDemandMatrixHandlers } from './hooks/useDemandMatrixHandlers';
import { createCloseHandlers, isComponentLoading } from './utils/demandMatrixUtils';

interface DemandMatrixContainerProps {
  className?: string;
  groupingMode: 'skill' | 'client';
}

/**
 * Container component that handles all business logic and data operations
 * for the Demand Matrix with stabilized filters to prevent infinite re-renders.
 * 
 * FIXED: Eliminates infinite loop through stable filter memoization
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

  console.log(`🔍 [STABLE CONTAINER] ========= CONTAINER RENDER =========`);
  console.log(`🔍 [STABLE CONTAINER] Controls state:`, {
    selectedSkills: demandMatrixControls.selectedSkills,
    selectedClients: demandMatrixControls.selectedClients,
    selectedPreferredStaff: demandMatrixControls.selectedPreferredStaff,
    monthRange: demandMatrixControls.monthRange,
    groupingMode
  });

  // STABILIZED: Memoize activeFilters to prevent object recreation on every render
  const activeFilters = useMemo(() => ({
    preferredStaff: demandMatrixControls.selectedPreferredStaff,
    skills: demandMatrixControls.selectedSkills,
    clients: demandMatrixControls.selectedClients
  }), [
    JSON.stringify(demandMatrixControls.selectedPreferredStaff),
    JSON.stringify(demandMatrixControls.selectedSkills),
    JSON.stringify(demandMatrixControls.selectedClients)
  ]);

  console.log(`🎯 [STABLE CONTAINER] Stable active filters prepared:`, {
    activeFilters,
    hasPreferredStaffFilter: !!(activeFilters.preferredStaff && activeFilters.preferredStaff.length > 0),
    preferredStaffCount: activeFilters.preferredStaff?.length || 0,
    skillsCount: activeFilters.skills?.length || 0,
    clientsCount: activeFilters.clients?.length || 0
  });

  // Data loading and management - pass stable active filters
  const { demandData, isLoading, error, loadDemandData, handleRetryWithBackoff } = useDemandMatrixData(
    groupingMode, 
    activeFilters
  );

  // Log whenever demandData changes
  useEffect(() => {
    if (demandData) {
      console.log(`📊 [STABLE CONTAINER] ========= DEMAND DATA RECEIVED =========`);
      console.log(`📊 [STABLE CONTAINER] Data summary:`, {
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
        console.log(`👨‍💼 [STABLE CONTAINER] STAFF-SPECIFIC DATA POINTS FOUND:`, {
          count: staffSpecificDataPoints.length,
          dataPoints: staffSpecificDataPoints.map(dp => ({
            skillType: dp.skillType,
            demandHours: dp.demandHours,
            taskCount: dp.taskCount,
            actualStaffName: dp.actualStaffName,
            isStaffSpecific: dp.isStaffSpecific,
            taskBreakdown: dp.taskBreakdown?.map(task => ({
              taskName: task.taskName,
              clientName: task.clientName,
              preferredStaffName: task.preferredStaffName
            }))
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
      console.log(`🔍 [STABLE CONTAINER] ========= FILTERED DATA =========`);
      console.log(`🔍 [STABLE CONTAINER] Filtered data summary:`, {
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
    demandMatrixControls,
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
