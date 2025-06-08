
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EnhancedMatrixLegend } from './EnhancedMatrixLegend';
import { MatrixData } from '@/services/forecasting/matrixUtils';
import { generateMatrixForecast, validateMatrixData } from '@/services/forecasting/matrixService';
import { useMatrixControls } from './hooks/useMatrixControls';
import { useMatrixSkills } from './hooks/useMatrixSkills';
import { useToast } from '@/components/ui/use-toast';
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

interface EnhancedCapacityMatrixProps {
  className?: string;
  forecastType?: 'virtual' | 'actual';
}

/**
 * Enhanced capacity matrix with dynamic skills integration
 * Refactored into smaller, focused components for better maintainability
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
  const { toast } = useToast();

  // Skills integration
  const { 
    availableSkills, 
    isLoading: skillsLoading, 
    error: skillsError,
    refetchSkills 
  } = useMatrixSkills();
  
  // Matrix controls with matrix skills synchronization
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
    matrixSkills: matrixData?.skills || [] // Pass matrix skills for synchronization
  });

  // Load matrix data
  const loadMatrixData = async () => {
    setIsLoading(true);
    setError(null);
    setValidationIssues([]);

    try {
      const { matrixData: newMatrixData } = await generateMatrixForecast(forecastType);
      
      // Validate the data with enhanced validation
      const issues = validateMatrixData(newMatrixData);
      if (issues.length > 0) {
        setValidationIssues(issues);
        console.warn('Matrix data validation issues:', issues);
        
        // Show validation issues in toast for debugging
        toast({
          title: "Matrix validation issues detected",
          description: `${issues.length} issues found. Check console for details.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Matrix data loaded successfully",
          description: `Loaded ${newMatrixData.months.length} months × ${newMatrixData.skills.length} skills`
        });
      }

      setMatrixData(newMatrixData);
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

  // Load data on mount and when forecast type changes
  useEffect(() => {
    loadMatrixData();
  }, [forecastType]);

  // Handle skills error
  useEffect(() => {
    if (skillsError) {
      toast({
        title: "Skills loading error",
        description: skillsError,
        variant: "destructive"
      });
    }
  }, [skillsError, toast]);

  // Filter data based on controls with improved filtering
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
        {/* Controls Panel */}
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
