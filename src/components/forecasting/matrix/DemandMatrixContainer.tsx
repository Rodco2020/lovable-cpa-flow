
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
 * Architecture:
 * - useDemandMatrixData: Handles data loading, caching, and retry logic
 * - useDemandMatrixFiltering: Manages data filtering and transformations
 * - useDemandMatrixHandlers: Handles user interactions and events
 * - useDemandMatrixControls: Manages filter controls state
 * - DemandMatrixPresentation: Pure UI component for rendering
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

  // Data loading and management
  const { demandData, isLoading, error, loadDemandData, handleRetryWithBackoff } = useDemandMatrixData(groupingMode);

  // Controls for filtering
  const demandMatrixControls = useDemandMatrixControls({
    demandData,
    groupingMode
  });

  // Data filtering logic
  const { getFilteredData } = useDemandMatrixFiltering(demandData, demandMatrixControls, groupingMode);

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
