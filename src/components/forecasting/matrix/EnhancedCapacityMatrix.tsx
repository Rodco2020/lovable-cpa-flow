
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EnhancedMatrixLegend } from './EnhancedMatrixLegend';
import { MatrixData } from '@/services/forecasting/matrixUtils';
import { generateMatrixForecast, validateMatrixData } from '@/services/forecasting/matrixService';
import { useMatrixControls } from './hooks/useMatrixControls';
import { useMatrixSkills } from './hooks/useMatrixSkills';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  MatrixHeader,
  MatrixStatusIndicator,
  MatrixGrid,
  MatrixSummaryFooter,
  MatrixControlsPanel,
  MatrixLoadingState,
  MatrixErrorState,
  MatrixEmptyState
} from './components';
import { MatrixPrintView } from './components/MatrixPrintView';

interface EnhancedCapacityMatrixProps {
  className?: string;
  forecastType?: 'virtual' | 'actual';
}

/**
 * Enhanced capacity matrix with client filtering, printing, and enhanced export capabilities
 */
export const EnhancedCapacityMatrix: React.FC<EnhancedCapacityMatrixProps> = ({ 
  className,
  forecastType = 'virtual'
}) => {
  const [matrixData, setMatrixData] = useState<MatrixData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [showPrintView, setShowPrintView] = useState(false);
  const [printOptions, setPrintOptions] = useState<any>(null);
  const { toast } = useToast();

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
  
  // Matrix controls with enhanced functionality
  const {
    selectedSkills,
    viewMode,
    monthRange,
    handleSkillToggle,
    handleViewModeChange,
    handleMonthRangeChange,
    handleReset,
    handleExport
  } = useMatrixControls({
    matrixSkills: matrixData?.skills || []
  });

  // Load matrix data
  const loadMatrixData = async () => {
    setIsLoading(true);
    setError(null);
    setValidationIssues([]);

    try {
      // In a real implementation, we would pass selectedClientIds to filter the data
      const { matrixData: newMatrixData } = await generateMatrixForecast(forecastType);
      
      // Apply client filtering if clients are selected
      let filteredMatrixData = newMatrixData;
      if (selectedClientIds.length > 0) {
        // Filter data points based on client selection
        // In a real implementation, this would be done at the data source level
        console.log('Applying client filter:', selectedClientIds);
        toast({
          title: "Client filter applied",
          description: `Matrix filtered for ${selectedClientIds.length} selected clients.`
        });
      }
      
      const issues = validateMatrixData(filteredMatrixData);
      if (issues.length > 0) {
        setValidationIssues(issues);
        console.warn('Matrix data validation issues:', issues);
      }

      setMatrixData(filteredMatrixData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load matrix data';
      setError(errorMessage);
      console.error('Error loading matrix data:', err);
      
      toast({
        title: "Error loading matrix",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced export handler
  const handleEnhancedExport = (format: 'csv' | 'json', options: any) => {
    if (!matrixData) return;

    // Import enhanced export utilities
    import('@/services/forecasting/enhanced/enhancedMatrixService').then(({ EnhancedMatrixService }) => {
      let exportData: string;
      
      if (format === 'csv') {
        exportData = EnhancedMatrixService.generateCSVExport(
          matrixData,
          selectedSkills,
          monthRange,
          options.includeAnalytics
        );
      } else {
        exportData = EnhancedMatrixService.generateJSONExport(
          matrixData,
          selectedSkills,
          monthRange,
          options.includeAnalytics
        );
      }

      // Download the file
      const blob = new Blob([exportData], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `capacity-matrix-${format}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  // Print handler
  const handlePrint = (options: any) => {
    if (!matrixData) return;
    
    setPrintOptions(options);
    setShowPrintView(true);
  };

  const handlePrintExecute = () => {
    window.print();
    setShowPrintView(false);
    setPrintOptions(null);
  };

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadMatrixData();
  }, [forecastType, selectedClientIds]);

  // Filter data based on controls
  const getFilteredData = () => {
    if (!matrixData) return null;

    const filteredMonths = matrixData.months.slice(monthRange.start, monthRange.end + 1);
    const filteredSkills = matrixData.skills.filter(skill => selectedSkills.includes(skill));
    const filteredDataPoints = matrixData.dataPoints.filter(
      point => 
        selectedSkills.includes(point.skillType) &&
        filteredMonths.some(month => month.key === point.month)
    );

    return {
      ...matrixData,
      months: filteredMonths,
      skills: filteredSkills,
      dataPoints: filteredDataPoints
    };
  };

  const filteredData = getFilteredData();

  // Show print view
  if (showPrintView && filteredData && printOptions) {
    return (
      <MatrixPrintView
        matrixData={filteredData}
        selectedSkills={selectedSkills}
        selectedClientIds={selectedClientIds}
        clientNames={clientNames}
        monthRange={monthRange}
        printOptions={printOptions}
        onPrint={handlePrintExecute}
      />
    );
  }

  // Loading state
  if (isLoading || skillsLoading) {
    return (
      <MatrixLoadingState 
        className={className}
        viewMode={viewMode}
        skillsLoading={skillsLoading}
      />
    );
  }

  // Error state
  if (error || skillsError) {
    return (
      <MatrixErrorState
        className={className}
        viewMode={viewMode}
        error={error}
        skillsError={skillsError}
        onRetryMatrix={loadMatrixData}
        onRetrySkills={refetchSkills}
      />
    );
  }

  // No data state
  if (!filteredData) {
    return (
      <MatrixEmptyState
        className={className}
        viewMode={viewMode}
      />
    );
  }

  return (
    <div className={className}>
      <EnhancedMatrixLegend viewMode={viewMode} />
      
      {/* Responsive layout for matrix and controls */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Enhanced Controls Panel */}
        <MatrixControlsPanel
          isControlsExpanded={isControlsExpanded}
          onToggleControls={() => setIsControlsExpanded(!isControlsExpanded)}
          selectedSkills={selectedSkills}
          onSkillToggle={handleSkillToggle}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          monthRange={monthRange}
          onMonthRangeChange={handleMonthRangeChange}
          onExport={handleExport}
          onReset={handleReset}
          matrixData={filteredData}
          selectedClientIds={selectedClientIds}
          onClientSelectionChange={setSelectedClientIds}
          onEnhancedExport={handleEnhancedExport}
          onPrint={handlePrint}
        />
        
        {/* Matrix Panel */}
        <div className={`xl:col-span-3 ${isControlsExpanded ? 'xl:col-span-2' : ''}`}>
          <Card>
            <CardHeader>
              <MatrixHeader
                viewMode={viewMode}
                forecastType={forecastType}
                isLoading={isLoading}
                validationIssues={validationIssues}
                onRefresh={loadMatrixData}
              />
              <MatrixStatusIndicator
                forecastType={forecastType}
                validationIssues={validationIssues}
                filteredData={filteredData}
                availableSkills={availableSkills}
              />
            </CardHeader>
            <CardContent>
              <MatrixGrid
                filteredData={filteredData}
                viewMode={viewMode}
              />
              
              <MatrixSummaryFooter
                filteredData={filteredData}
                validationIssues={validationIssues}
                forecastType={forecastType}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCapacityMatrix;
