
import React, { useEffect } from 'react';
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
 * for the Demand Matrix. This component orchestrates data fetching, state management,
 * and business logic while delegating UI rendering to the presentation component.
 * 
 * ENHANCED: Comprehensive verification logging for staff aggregation
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

  console.log(`🔍 [VERIFICATION - MATRIX CONTAINER] ========= CONTAINER RENDER =========`);
  console.log(`🔍 [VERIFICATION - MATRIX CONTAINER] Controls state:`, {
    selectedSkills: demandMatrixControls.selectedSkills,
    selectedClients: demandMatrixControls.selectedClients,
    selectedPreferredStaff: demandMatrixControls.selectedPreferredStaff,
    monthRange: demandMatrixControls.monthRange,
    groupingMode
  });

  // Prepare active filters for data loading
  const activeFilters = {
    preferredStaff: demandMatrixControls.selectedPreferredStaff,
    skills: demandMatrixControls.selectedSkills,
    clients: demandMatrixControls.selectedClients
  };

  console.log(`🎯 [VERIFICATION - MATRIX CONTAINER] Active filters prepared:`, {
    activeFilters,
    hasPreferredStaffFilter: !!(activeFilters.preferredStaff && activeFilters.preferredStaff.length > 0),
    preferredStaffCount: activeFilters.preferredStaff?.length || 0,
    skillsCount: activeFilters.skills?.length || 0,
    clientsCount: activeFilters.clients?.length || 0
  });

  // Data loading and management - pass active filters
  const { demandData, isLoading, error, loadDemandData, handleRetryWithBackoff } = useDemandMatrixData(
    groupingMode, 
    activeFilters
  );

  // Log whenever demandData changes
  useEffect(() => {
    if (demandData) {
      console.log(`📊 [VERIFICATION - MATRIX CONTAINER] ========= DEMAND DATA RECEIVED =========`);
      console.log(`📊 [VERIFICATION - MATRIX CONTAINER] Data summary:`, {
        aggregationStrategy: demandData.aggregationStrategy,
        dataPoints: demandData.dataPoints.length,
        skills: demandData.skills.length,
        months: demandData.months.length,
        totalDemand: demandData.totalDemand,
        totalTasks: demandData.totalTasks
      });
      
      console.log(`📋 [VERIFICATION - MATRIX CONTAINER] All data points:`, 
        demandData.dataPoints.map((dp, index) => ({
          index,
          skillType: dp.skillType,
          month: dp.month,
          monthLabel: dp.monthLabel,
          demandHours: dp.demandHours,
          taskCount: dp.taskCount,
          isStaffSpecific: dp.isStaffSpecific,
          actualStaffName: dp.actualStaffName,
          underlyingSkillType: dp.underlyingSkillType,
          taskBreakdownCount: dp.taskBreakdown?.length || 0
        }))
      );
      
      // Special focus on Marciano's data if present
      const marcianoDataPoints = demandData.dataPoints.filter(dp => 
        dp.actualStaffName?.toLowerCase().includes('marciano') ||
        dp.skillType?.toLowerCase().includes('marciano')
      );
      
      if (marcianoDataPoints.length > 0) {
        console.log(`👨‍💼 [VERIFICATION - MATRIX CONTAINER] MARCIANO'S DATA POINTS FOUND:`, {
          count: marcianoDataPoints.length,
          dataPoints: marcianoDataPoints.map(dp => ({
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
      } else {
        console.log(`❌ [VERIFICATION - MATRIX CONTAINER] NO MARCIANO DATA POINTS FOUND`);
      }
    }
  }, [demandData]);

  // Data filtering logic
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
      console.log(`🔍 [VERIFICATION - MATRIX CONTAINER] ========= FILTERED DATA =========`);
      console.log(`🔍 [VERIFICATION - MATRIX CONTAINER] Filtered data summary:`, {
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
    retryCount: 0, // This could be extracted to state if needed
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
