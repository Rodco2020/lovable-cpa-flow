
import React, { useEffect } from 'react';
import { useMatrixSkills } from './hooks/useMatrixSkills';
import { EnhancedMatrixState } from './components/EnhancedMatrixState';
import { MatrixPrintView } from './components/MatrixPrintView';
import { EnhancedMatrixMain } from './components/EnhancedMatrixMain';
import { useEnhancedMatrixState } from './hooks/useEnhancedMatrixState';
import { useEnhancedMatrixClients } from './hooks/useEnhancedMatrixClients';
import { useEnhancedMatrixData } from './hooks/useEnhancedMatrixData';
import { useEnhancedMatrixExport } from './hooks/useEnhancedMatrixExport';
import { useEnhancedMatrixPrint } from './hooks/useEnhancedMatrixPrint';
import { useEnhancedMatrixActions } from './hooks/useEnhancedMatrixActions';
import { filterMatrixData } from './utils/matrixDataFilter';

interface EnhancedCapacityMatrixProps {
  className?: string;
  forecastType?: 'virtual' | 'actual';
}

/**
 * Enhanced capacity matrix with Phase 4 UI/UX improvements
 * 
 * This component includes all Phase 4 enhancements:
 * - Enhanced visual feedback with toast notifications
 * - Debounced matrix updates for performance
 * - Better loading states and refresh indicators
 * - Improved accessibility with keyboard navigation
 * - Clear indicators of active filters
 * - Better error messages and help text
 * 
 * Key features:
 * - Interactive capacity vs demand matrix visualization
 * - Client filtering capabilities with automatic default selection
 * - Enhanced export options (CSV, JSON)
 * - Print functionality with customizable options
 * - Skills synchronization and validation
 * - Responsive layout with collapsible controls
 * 
 * Architecture:
 * - useEnhancedMatrixState: UI state management
 * - useEnhancedMatrixClients: Client data fetching and default selection
 * - useEnhancedMatrixData: Matrix data management with debouncing
 * - useEnhancedMatrixActions: Export and print actions
 * - EnhancedMatrixMain: Main content display component
 */
export const EnhancedCapacityMatrix: React.FC<EnhancedCapacityMatrixProps> = ({ 
  className,
  forecastType = 'virtual'
}) => {
  // UI state management - refactored into custom hook
  const {
    isControlsExpanded,
    selectedClientIds,
    setSelectedClientIds,
    selectedSkills,
    setSelectedSkills,
    forecastMode,
    setForecastMode,
    startMonth,
    setStartMonth
  } = useEnhancedMatrixState(forecastType);

  // Client data management - refactored into custom hook
  const {
    clients,
    clientNames,
    isLoading: clientsLoading,
    error: clientsError
  } = useEnhancedMatrixClients({
    selectedClientIds,
    setSelectedClientIds
  });

  // Skills integration - existing hook
  const { 
    availableSkills, 
    isLoading: skillsLoading, 
    error: skillsError,
    refetchSkills 
  } = useMatrixSkills();
  
  // Enhanced matrix data management with debouncing and better UX
  // CRITICAL FIX: Pass total client count for proper "all clients" detection
  const {
    matrixData,
    isLoading,
    isRefreshing,
    error,
    validationIssues,
    loadMatrixData
  } = useEnhancedMatrixData({
    forecastType: forecastMode,
    selectedClientIds,
    totalClientCount: clients.length // KEY FIX: Pass total client count
  });

  // Export functionality - existing hook
  const { handleEnhancedExport } = useEnhancedMatrixExport({
    matrixData,
    selectedSkills,
    monthRange: { start: 0, end: 11 }
  });

  // Print functionality - existing hook
  const {
    showPrintView,
    printOptions,
    handlePrint,
    handlePrintExecute
  } = useEnhancedMatrixPrint();

  // Action handlers - refactored into custom hook
  const { handleExport, handlePrintAction } = useEnhancedMatrixActions({
    matrixData,
    selectedSkills,
    onEnhancedExport: handleEnhancedExport,
    onPrint: handlePrint
  });

  // Filter data based on controls
  const filteredData = filterMatrixData(matrixData, {
    selectedSkills,
    monthRange: { start: 0, end: 11 }
  });

  // Debug logging for Phase 4 verification with CLIENT FILTERING FIX
  useEffect(() => {
    console.log('🎨 EnhancedCapacityMatrix: Phase 4 State Check with CLIENT FILTERING FIX:', {
      hasClients: clients.length > 0,
      totalClientCount: clients.length,
      selectedClientCount: selectedClientIds.length,
      isAllClientsSelected: clients.length > 0 && selectedClientIds.length === clients.length,
      shouldShowData: selectedClientIds.length > 0,
      matrixDataAvailable: !!matrixData,
      isLoading,
      isRefreshing,
      hasValidationIssues: validationIssues.length > 0,
      clientFilteringLogicFixed: true
    });
  }, [clients, selectedClientIds, matrixData, isLoading, isRefreshing, validationIssues]);

  // Show print view
  if (showPrintView && filteredData && printOptions) {
    return (
      <MatrixPrintView
        matrixData={filteredData}
        selectedSkills={selectedSkills}
        selectedClientIds={selectedClientIds}
        clientNames={clientNames}
        monthRange={{ start: 0, end: 11 }}
        printOptions={printOptions}
        onPrint={handlePrintExecute}
      />
    );
  }

  // Show loading, error, or empty states with enhanced UX
  if (isLoading || skillsLoading || clientsLoading || error || skillsError || clientsError || !filteredData) {
    return (
      <EnhancedMatrixState
        className={className}
        viewMode="hours"
        isLoading={isLoading || clientsLoading}
        skillsLoading={skillsLoading}
        isRefreshing={isRefreshing}
        error={error || clientsError || ''}
        skillsError={skillsError}
        filteredData={filteredData}
        selectedClientCount={selectedClientIds.length}
        onRetryMatrix={loadMatrixData}
        onRetrySkills={refetchSkills}
      />
    );
  }

  // Main matrix display with enhanced UX features
  return (
    <div className={className}>
      <EnhancedMatrixMain
        isControlsExpanded={isControlsExpanded}
        selectedSkills={selectedSkills}
        onSkillsChange={setSelectedSkills}
        forecastMode={forecastMode}
        onForecastModeChange={setForecastMode}
        startMonth={startMonth}
        onStartMonthChange={setStartMonth}
        onExport={handleExport}
        onPrint={handlePrintAction}
        selectedClientIds={selectedClientIds}
        onClientSelectionChange={setSelectedClientIds}
        filteredData={filteredData!}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        validationIssues={validationIssues}
        availableSkills={availableSkills}
        onRefresh={loadMatrixData}
      />
    </div>
  );
};

export default EnhancedCapacityMatrix;
