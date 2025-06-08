
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DemandMatrixData } from '@/types/demand';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';
import { useDemandMatrixControls } from './hooks/useDemandMatrixControls';
import { useToast } from '@/components/ui/use-toast';
import {
  DemandMatrixHeader,
  DemandMatrixGrid,
  DemandMatrixControlsPanel,
  DemandMatrixLoadingState,
  DemandMatrixErrorState,
  DemandMatrixEmptyState,
  DemandMatrixSummaryFooter
} from './components/demand';

interface DemandMatrixProps {
  className?: string;
  groupingMode: 'skill' | 'client';
}

/**
 * Enhanced Demand Matrix Component
 * 
 * Displays demand forecasting data in a matrix format with enhanced controls
 * and filtering capabilities. Supports both skill-based and client-based grouping.
 */
export const DemandMatrix: React.FC<DemandMatrixProps> = ({ 
  className,
  groupingMode 
}) => {
  const [demandData, setDemandData] = useState<DemandMatrixData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const { toast } = useToast();

  // Demand-specific controls
  const {
    selectedSkills,
    selectedClients,
    monthRange,
    handleSkillToggle,
    handleClientToggle,
    handleMonthRangeChange,
    handleReset,
    handleExport,
    availableSkills,
    availableClients,
    skillsLoading,
    clientsLoading
  } = useDemandMatrixControls({
    demandData,
    groupingMode
  });

  // Load demand matrix data
  const loadDemandData = async () => {
    setIsLoading(true);
    setError(null);
    setValidationIssues([]);

    try {
      const { matrixData: newDemandData } = await DemandMatrixService.generateDemandMatrix('demand-only');
      
      // Validate the data
      const issues = DemandMatrixService.validateDemandMatrixData(newDemandData);
      if (issues.length > 0) {
        setValidationIssues(issues);
        console.warn('Demand matrix validation issues:', issues);
        
        toast({
          title: "Demand matrix validation issues detected",
          description: `${issues.length} issues found. Check console for details.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Demand matrix loaded successfully",
          description: `Loaded ${newDemandData.months.length} months × ${newDemandData.skills.length} skills`
        });
      }

      setDemandData(newDemandData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load demand matrix data';
      setError(errorMessage);
      console.error('Error loading demand matrix data:', err);
      
      toast({
        title: "Error loading demand matrix",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadDemandData();
  }, []);

  // Filter data based on controls and grouping mode
  const getFilteredData = () => {
    if (!demandData) return null;

    const filteredMonths = demandData.months.slice(monthRange.start, monthRange.end + 1);
    
    // Filter based on grouping mode
    if (groupingMode === 'skill') {
      const filteredSkills = demandData.skills.filter(skill => selectedSkills.includes(skill));
      const filteredDataPoints = demandData.dataPoints.filter(
        point => 
          selectedSkills.includes(point.skillType) &&
          filteredMonths.some(month => month.key === point.month)
      );

      return {
        ...demandData,
        months: filteredMonths,
        skills: filteredSkills,
        dataPoints: filteredDataPoints
      };
    } else {
      // Client-based grouping - group data points by client
      const filteredClients = Array.from(new Set(
        demandData.dataPoints
          .flatMap(point => point.taskBreakdown.map(task => task.clientId))
          .filter(clientId => selectedClients.includes(clientId))
      ));

      // Transform data for client-based view
      const clientGroupedData = {
        ...demandData,
        months: filteredMonths,
        skills: filteredClients, // Use clients as "skills" for display
        dataPoints: filteredClients.flatMap(clientId => 
          filteredMonths.map(month => {
            const clientTasks = demandData.dataPoints
              .find(point => point.month === month.key)
              ?.taskBreakdown.filter(task => task.clientId === clientId) || [];

            const totalHours = clientTasks.reduce((sum, task) => sum + task.monthlyHours, 0);
            
            return {
              skillType: clientId, // Using clientId as skillType for consistency
              month: month.key,
              monthLabel: month.label,
              demandHours: totalHours,
              taskCount: clientTasks.length,
              clientCount: 1,
              taskBreakdown: clientTasks
            };
          })
        )
      };

      return clientGroupedData;
    }
  };

  const filteredData = getFilteredData();

  // Loading state
  if (isLoading || skillsLoading || clientsLoading) {
    return (
      <DemandMatrixLoadingState 
        className={className}
        groupingMode={groupingMode}
      />
    );
  }

  // Error state
  if (error) {
    return (
      <DemandMatrixErrorState
        className={className}
        error={error}
        onRetry={loadDemandData}
        groupingMode={groupingMode}
      />
    );
  }

  // No data state
  if (!filteredData) {
    return (
      <DemandMatrixEmptyState
        className={className}
        groupingMode={groupingMode}
      />
    );
  }

  return (
    <div className={className}>
      {/* Responsive layout for matrix and controls */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Controls Panel */}
        <DemandMatrixControlsPanel
          isControlsExpanded={isControlsExpanded}
          onToggleControls={() => setIsControlsExpanded(!isControlsExpanded)}
          selectedSkills={selectedSkills}
          selectedClients={selectedClients}
          onSkillToggle={handleSkillToggle}
          onClientToggle={handleClientToggle}
          monthRange={monthRange}
          onMonthRangeChange={handleMonthRangeChange}
          onExport={handleExport}
          onReset={handleReset}
          groupingMode={groupingMode}
          availableSkills={availableSkills}
          availableClients={availableClients}
        />
        
        {/* Matrix Panel */}
        <div className={`xl:col-span-3 ${isControlsExpanded ? 'xl:col-span-2' : ''}`}>
          <Card>
            <CardHeader>
              <DemandMatrixHeader
                groupingMode={groupingMode}
                isLoading={isLoading}
                validationIssues={validationIssues}
                onRefresh={loadDemandData}
              />
            </CardHeader>
            <CardContent>
              <DemandMatrixGrid
                filteredData={filteredData}
                groupingMode={groupingMode}
              />
              
              <DemandMatrixSummaryFooter
                filteredData={filteredData}
                validationIssues={validationIssues}
                groupingMode={groupingMode}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DemandMatrix;
