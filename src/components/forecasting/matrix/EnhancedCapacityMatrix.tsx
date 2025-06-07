
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
 * Enhanced capacity matrix with client filtering, printing, and enhanced export capabilities
 * 
 * This component has been refactored for improved maintainability while preserving
 * all existing functionality and UI behavior.
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
 * - useEnhancedMatrixData: Matrix data management
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
  
  // Matrix data management - existing hook
  const {
    matrixData,
    isLoading,
    error,
    validationIssues,
    loadMatrixData
  } = useEnhancedMatrixData({
    forecastType: forecastMode,
    selectedClientIds
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

  // Debug logging for Phase 2 verification
  useEffect(() => {
    console.log('🎨 EnhancedCapacityMatrix: Phase 2 State Check:', {
      hasClients: clients.length > 0,
      selectedClientCount: selectedClientIds.length,
      shouldShowData: selectedClientIds.length > 0,
      matrixDataAvailable: !!matrixData,
      isLoading
    });
  }, [clients, selectedClientIds, matrixData, isLoading]);

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

  // Show loading, error, or empty states
  if (isLoading || skillsLoading || clientsLoading || error || skillsError || clientsError || !filteredData) {
    return (
      <EnhancedMatrixState
        className={className}
        viewMode="hours"
        isLoading={isLoading || clientsLoading}
        skillsLoading={skillsLoading}
        error={error || clientsError || ''}
        skillsError={skillsError}
        filteredData={filteredData}
        onRetryMatrix={loadMatrixData}
        onRetrySkills={refetchSkills}
      />
    );
  }

  // Main matrix display - refactored into separate component
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
        validationIssues={validationIssues}
        availableSkills={availableSkills}
        onRefresh={loadMatrixData}
      />
    </div>
  );
};

export default EnhancedCapacityMatrix;
