
import React, { useEffect, useMemo } from 'react';
import { useDemandMatrixControls } from '../hooks/useDemandMatrixControls';
import { useDemandMatrixRealtime } from '@/hooks/useDemandMatrixRealtime';
import { useDemandMatrixState } from '../DemandMatrixStateProvider';
import { useDemandMatrixData } from '../hooks/useDemandMatrixData';
import { useDemandMatrixFiltering } from '../hooks/useDemandMatrixFiltering';
import { useDemandMatrixHandlers } from '../hooks/useDemandMatrixHandlers';
import { useMatrixFiltering } from '../hooks/useMatrixFiltering';
import { useStaffForecastSummary } from './hooks/useStaffForecastSummary';
import { createCloseHandlers, isComponentLoading } from '../utils/demandMatrixUtils';

interface DetailMatrixContainerProps {
  className?: string;
  groupingMode: 'skill' | 'client';
  initialViewMode?: string;
}

/**
 * PHASE 1: DetailMatrixContainer with corrected data flow for Staff Forecast Summary
 */
export const DetailMatrixContainer: React.FC<DetailMatrixContainerProps> = ({
  className,
  groupingMode,
  initialViewMode = 'detail-matrix'
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
    demandData: null,
    groupingMode
  });

  console.log(`🔍 [DETAIL CONTAINER] ========= CONTAINER RENDER =========`);
  console.log(`🔍 [DETAIL CONTAINER] Controls state:`, {
    selectedSkills: demandMatrixControls.selectedSkills,
    selectedClients: demandMatrixControls.selectedClients,
    selectedPreferredStaff: demandMatrixControls.selectedPreferredStaff,
    monthRange: demandMatrixControls.monthRange,
    groupingMode,
    initialViewMode
  });

  // Stabilize activeFilters to prevent infinite loops
  const activeFilters = useMemo(() => ({
    preferredStaff: demandMatrixControls.selectedPreferredStaff,
    skills: demandMatrixControls.selectedSkills,
    clients: demandMatrixControls.selectedClients
  }), [
    JSON.stringify(demandMatrixControls.selectedPreferredStaff),
    JSON.stringify(demandMatrixControls.selectedSkills),
    JSON.stringify(demandMatrixControls.selectedClients)
  ]);

  // Data loading with stabilized filters
  const { demandData: data, isLoading, error, loadDemandData, handleRetryWithBackoff } = useDemandMatrixData(
    groupingMode, 
    activeFilters
  );

  // Extract available options from the loaded demand data
  const matrixFiltering = useMatrixFiltering({
    demandData: data,
    selectedSkills: demandMatrixControls.selectedSkills,
    selectedClients: demandMatrixControls.selectedClients,
    selectedPreferredStaff: demandMatrixControls.selectedPreferredStaff,
    monthRange: demandMatrixControls.monthRange,
    groupingMode
  });

  // Data filtering logic with stable filters
  const { getFilteredData } = useDemandMatrixFiltering({
    demandData: data,
    selectedSkills: demandMatrixControls.selectedSkills,
    selectedClients: demandMatrixControls.selectedClients,
    selectedPreferredStaff: demandMatrixControls.selectedPreferredStaff,
    monthRange: demandMatrixControls.monthRange,
    groupingMode
  });

  // Get filtered data
  const filteredData = getFilteredData();

  // Extract filtered tasks from the filtered data
  const filteredTasks = useMemo(() => {
    if (!filteredData || !filteredData.tasks) return [];
    
    console.log('🎯 [DETAIL CONTAINER] Extracting filtered tasks:', {
      totalDataPoints: filteredData.dataPoints.length,
      tasksCount: filteredData.tasks.length,
      sampleTask: filteredData.tasks[0] ? {
        taskName: filteredData.tasks[0].taskName,
        preferredStaffId: filteredData.tasks[0].preferredStaffId,
        skillRequired: filteredData.tasks[0].skillRequired
      } : null
    });
    
    return filteredData.tasks;
  }, [filteredData]);

  // Get months from data
  const months = useMemo(() => {
    return data?.months || [];
  }, [data]);

  // PHASE 1: FIXED - Staff Forecast Summary with pre-filtered data
  const { 
    utilizationData, 
    isLoading: staffLoading, 
    error: staffError 
  } = useStaffForecastSummary({
    tasks: filteredTasks || [],  // ← PHASE 1: USE FILTERED TASKS!
    months: months || [],
    selectedSkills: demandMatrixControls?.selectedSkills || [],
    selectedClients: demandMatrixControls?.selectedClients || [],
    selectedPreferredStaff: demandMatrixControls?.selectedPreferredStaff || [],
    enabled: initialViewMode === 'staff-forecast-summary',
    isPreFiltered: true  // ← PHASE 1: ADD THIS FLAG
  });

  // Event handlers
  const {
    handleCellClick,
    handleTimeHorizonChange,
    handleShowExport,
    handleShowPrintExport,
    handleCustomDateRangeChange
  } = useDemandMatrixHandlers(data, demandMatrixControls);

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

  // Log data flow for debugging
  useEffect(() => {
    if (initialViewMode === 'staff-forecast-summary') {
      console.log(`🎯 [DETAIL CONTAINER] Staff Forecast Summary Data Flow:`, {
        rawDataTasks: data?.tasks?.length || 0,
        filteredTasksCount: filteredTasks.length,
        utilizationDataCount: utilizationData.length,
        staffLoading,
        staffError,
        dataFlowCorrect: filteredTasks.length > 0 && utilizationData.length > 0
      });
    }
  }, [initialViewMode, data, filteredTasks, utilizationData, staffLoading, staffError]);

  // Check if component is in loading state
  const componentIsLoading = isComponentLoading(
    isLoading,
    demandMatrixControls.skillsLoading,
    demandMatrixControls.clientsLoading
  );

  // Prepare enhanced controls with proper data
  const enhancedDemandMatrixControls = {
    ...demandMatrixControls,
    availableSkills: matrixFiltering.availableSkills,
    availableClients: matrixFiltering.availableClients,
    availablePreferredStaff: matrixFiltering.availablePreferredStaff,
    isAllSkillsSelected: matrixFiltering.isAllSkillsSelected,
    isAllClientsSelected: matrixFiltering.isAllClientsSelected,
    isAllPreferredStaffSelected: matrixFiltering.isAllPreferredStaffSelected,
    skillsLoading: false,
    clientsLoading: false,
    preferredStaffLoading: false,
    skillsError: null,
    clientsError: null,
    preferredStaffError: null
  };

  return {
    data,
    filteredData,
    filteredTasks,
    utilizationData,
    isLoading: componentIsLoading,
    staffLoading,
    error: error || staffError,
    validationIssues,
    isControlsExpanded,
    drillDownData,
    selectedDrillDown,
    showExportDialog,
    showPrintExportDialog,
    timeHorizon,
    customDateRange,
    demandMatrixControls: enhancedDemandMatrixControls,
    months,
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
};
