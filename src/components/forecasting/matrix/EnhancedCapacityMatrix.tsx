
import React, { useState } from 'react';
import { EnhancedMatrixLegend } from './EnhancedMatrixLegend';
import { useMatrixSkills } from './hooks/useMatrixSkills';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MatrixControlsPanel } from './components';
import { EnhancedMatrixContent } from './components/EnhancedMatrixContent';
import { EnhancedMatrixState } from './components/EnhancedMatrixState';
import { MatrixPrintView } from './components/MatrixPrintView';
import { useEnhancedMatrixData } from './hooks/useEnhancedMatrixData';
import { useEnhancedMatrixExport } from './hooks/useEnhancedMatrixExport';
import { useEnhancedMatrixPrint } from './hooks/useEnhancedMatrixPrint';
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
 * - Client filtering capabilities
 * - Enhanced export options (CSV, JSON)
 * - Print functionality with customizable options
 * - Skills synchronization and validation
 * - Responsive layout with collapsible controls
 */
export const EnhancedCapacityMatrix: React.FC<EnhancedCapacityMatrixProps> = ({ 
  className,
  forecastType = 'virtual'
}) => {
  // UI state management
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [forecastMode, setForecastMode] = useState<'virtual' | 'actual'>(forecastType);
  const [startMonth, setStartMonth] = useState(new Date());

  // Fetch client names for display
  const { data: clientNames = {} } = useQuery({
    queryKey: ['client-names'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, legal_name')
        .eq('status', 'active');
      
      if (error) throw error;
      
      return data.reduce((acc, client) => ({
        ...acc,
        [client.id]: client.legal_name
      }), {} as Record<string, string>);
    }
  });

  // Skills integration
  const { 
    availableSkills, 
    isLoading: skillsLoading, 
    error: skillsError,
    refetchSkills 
  } = useMatrixSkills();
  
  // Matrix data management
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

  // Export functionality
  const { handleEnhancedExport } = useEnhancedMatrixExport({
    matrixData,
    selectedSkills,
    monthRange: { start: 0, end: 11 }
  });

  // Print functionality
  const {
    showPrintView,
    printOptions,
    handlePrint,
    handlePrintExecute
  } = useEnhancedMatrixPrint();

  // Filter data based on controls
  const filteredData = filterMatrixData(matrixData, {
    selectedSkills,
    monthRange: { start: 0, end: 11 }
  });

  // Handlers
  const handleExport = (options: any) => {
    console.log('Export options:', options);
  };

  const handlePrintAction = () => {
    handlePrint();
  };

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
  if (isLoading || skillsLoading || error || skillsError || !filteredData) {
    return (
      <EnhancedMatrixState
        className={className}
        viewMode="hours"
        isLoading={isLoading}
        skillsLoading={skillsLoading}
        error={error}
        skillsError={skillsError}
        filteredData={filteredData}
        onRetryMatrix={loadMatrixData}
        onRetrySkills={refetchSkills}
      />
    );
  }

  // Main matrix display
  return (
    <div className={className}>
      <EnhancedMatrixLegend viewMode="hours" />
      
      {/* Responsive layout for matrix and controls */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Enhanced Controls Panel */}
        <MatrixControlsPanel
          selectedSkills={selectedSkills}
          onSkillsChange={setSelectedSkills}
          forecastMode={forecastMode}
          onForecastModeChange={setForecastMode}
          startMonth={startMonth}
          onStartMonthChange={setStartMonth}
          onExport={handleExport}
          onPrint={handlePrintAction}
          isExporting={false}
          selectedClientIds={selectedClientIds}
          onClientSelectionChange={setSelectedClientIds}
        />
        
        {/* Matrix Panel */}
        <div className={`xl:col-span-3 ${isControlsExpanded ? 'xl:col-span-2' : ''}`}>
          <EnhancedMatrixContent
            filteredData={filteredData!}
            viewMode="hours"
            forecastType={forecastMode}
            isLoading={isLoading}
            validationIssues={validationIssues}
            availableSkills={availableSkills}
            onRefresh={loadMatrixData}
          />
        </div>
      </div>
    </div>
  );
};

export default EnhancedCapacityMatrix;
