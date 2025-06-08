import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DemandMatrixData } from '@/types/demand';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';
import { DemandDrillDownService } from '@/services/forecasting/demand/demandDrillDownService';
import { useDemandMatrixControls } from './hooks/useDemandMatrixControls';
import { useToast } from '@/components/ui/use-toast';
import { SkillType } from '@/types/task';
import { DemandDrillDownData } from '@/types/demandDrillDown';
import {
  DemandMatrixHeader,
  DemandMatrixGrid,
  DemandMatrixControlsPanel,
  DemandMatrixLoadingState,
  DemandMatrixErrorState,
  DemandMatrixEmptyState,
  DemandMatrixSummaryFooter,
  DemandDrillDownDialog,
  DemandMatrixTimeControls,
  DemandMatrixExportDialog
} from './components/demand';

interface DemandMatrixProps {
  className?: string;
  groupingMode: 'skill' | 'client';
}

/**
 * Enhanced Demand Matrix Component (Phase 4)
 * 
 * Now includes drill-down capabilities, export functionality, and time horizon controls
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
  
  // Phase 4: New state for advanced features
  const [drillDownData, setDrillDownData] = useState<DemandDrillDownData | null>(null);
  const [selectedDrillDown, setSelectedDrillDown] = useState<{skill: SkillType; month: string} | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [timeHorizon, setTimeHorizon] = useState<'quarter' | 'half-year' | 'year' | 'custom'>('year');
  const [customDateRange, setCustomDateRange] = useState<{start: Date; end: Date}>();
  
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

  // Phase 4: Handle drill-down cell clicks
  const handleCellClick = async (skill: SkillType, month: string) => {
    if (!demandData) return;
    
    try {
      setSelectedDrillDown({ skill, month });
      const drillDown = DemandDrillDownService.generateDrillDownData(demandData, skill, month);
      setDrillDownData(drillDown);
    } catch (err) {
      console.error('Error generating drill-down data:', err);
      toast({
        title: "Error loading details",
        description: "Failed to load drill-down data for this cell",
        variant: "destructive"
      });
    }
  };

  // Phase 4: Handle time horizon changes
  const handleTimeHorizonChange = (horizon: 'quarter' | 'half-year' | 'year' | 'custom') => {
    setTimeHorizon(horizon);
    
    // Adjust month range based on horizon
    switch (horizon) {
      case 'quarter':
        handleMonthRangeChange({ start: 0, end: 2 });
        break;
      case 'half-year':
        handleMonthRangeChange({ start: 0, end: 5 });
        break;
      case 'year':
        handleMonthRangeChange({ start: 0, end: 11 });
        break;
      case 'custom':
        // Keep current range until custom dates are set
        break;
    }
  };

  // Phase 4: Handle export dialog
  const handleShowExport = () => {
    setShowExportDialog(true);
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
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Controls Panel - Enhanced with time controls */}
        <div className={`xl:col-span-1 ${isControlsExpanded ? 'xl:col-span-2' : ''}`}>
          <div className="space-y-4">
            {/* Time Horizon Controls */}
            <DemandMatrixTimeControls
              timeHorizon={timeHorizon}
              customDateRange={customDateRange}
              onTimeHorizonChange={handleTimeHorizonChange}
              onCustomDateRangeChange={setCustomDateRange}
            />
            
            {/* Standard Controls Panel */}
            <DemandMatrixControlsPanel
              isControlsExpanded={isControlsExpanded}
              onToggleControls={() => setIsControlsExpanded(!isControlsExpanded)}
              selectedSkills={selectedSkills}
              selectedClients={selectedClients}
              onSkillToggle={handleSkillToggle}
              onClientToggle={handleClientToggle}
              monthRange={monthRange}
              onMonthRangeChange={handleMonthRangeChange}
              onExport={handleShowExport} // Use new export dialog
              onReset={handleReset}
              groupingMode={groupingMode}
              availableSkills={availableSkills}
              availableClients={availableClients}
            />
          </div>
        </div>
        
        {/* Matrix Panel */}
        <div className={`xl:col-span-4 ${isControlsExpanded ? 'xl:col-span-3' : ''}`}>
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
              {/* Enhanced Grid with Click Handling */}
              <div onClick={(e) => {
                const target = e.target as HTMLElement;
                const skillOrClient = target.getAttribute('data-skill');
                const month = target.getAttribute('data-month');
                
                if (skillOrClient && month) {
                  handleCellClick(skillOrClient as SkillType, month);
                }
              }}>
                <DemandMatrixGrid
                  filteredData={filteredData}
                  groupingMode={groupingMode}
                />
              </div>
              
              <DemandMatrixSummaryFooter
                filteredData={filteredData}
                validationIssues={validationIssues}
                groupingMode={groupingMode}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Phase 4: Advanced Feature Dialogs */}
      
      {/* Drill-Down Dialog */}
      <DemandDrillDownDialog
        isOpen={!!drillDownData}
        onClose={() => {
          setDrillDownData(null);
          setSelectedDrillDown(null);
        }}
        skill={selectedDrillDown?.skill || null}
        month={selectedDrillDown?.month || null}
        data={drillDownData}
      />

      {/* Export Dialog */}
      {demandData && (
        <DemandMatrixExportDialog
          isOpen={showExportDialog}
          onClose={() => setShowExportDialog(false)}
          demandData={demandData}
          selectedSkills={selectedSkills}
          selectedClients={selectedClients}
          monthRange={monthRange}
        />
      )}
    </div>
  );
};

export default DemandMatrix;
