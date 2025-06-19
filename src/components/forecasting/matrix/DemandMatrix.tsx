import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DemandMatrixData } from '@/types/demand';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';
import { DemandDrillDownService } from '@/services/forecasting/demand/demandDrillDownService';
import { DemandPerformanceOptimizer } from '@/services/forecasting/demand/performanceOptimizer';
import { useDemandMatrixControls } from './hooks/useDemandMatrixControls';
import { useDemandMatrixRealtime } from '@/hooks/useDemandMatrixRealtime';
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
import { DemandMatrixErrorBoundary } from './components/demand/DemandMatrixErrorBoundary';
import { DemandMatrixPrintExportDialog } from './components/demand/DemandMatrixPrintExportDialog';

interface DemandMatrixProps {
  className?: string;
  groupingMode: 'skill' | 'client';
}

/**
 * Enhanced Demand Matrix Component with Print/Export Functionality
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
  const [retryCount, setRetryCount] = useState(0);
  
  // Phase 4: Advanced features state
  const [drillDownData, setDrillDownData] = useState<DemandDrillDownData | null>(null);
  const [selectedDrillDown, setSelectedDrillDown] = useState<{skill: SkillType; month: string} | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showPrintExportDialog, setShowPrintExportDialog] = useState(false); // NEW: Print/Export dialog state
  const [timeHorizon, setTimeHorizon] = useState<'quarter' | 'half-year' | 'year' | 'custom'>('year');
  const [customDateRange, setCustomDateRange] = useState<{start: Date; end: Date}>();
  
  const { toast } = useToast();

  // Load demand matrix data with performance optimization
  const loadDemandData = async () => {
    const startTime = performance.now();
    setIsLoading(true);
    setError(null);
    setValidationIssues([]);

    try {
      console.log(`Loading demand data (attempt ${retryCount + 1})`);
      
      const { matrixData: newDemandData } = await DemandMatrixService.generateDemandMatrix('demand-only');
      
      // Validate the data
      const issues = DemandMatrixService.validateDemandMatrixData(newDemandData);
      if (issues.length > 0) {
        setValidationIssues(issues);
        console.warn('Demand matrix validation issues:', issues);
        
        toast({
          title: "Data quality issues detected",
          description: `${issues.length} validation issues found. Functionality may be limited.`,
          variant: "destructive"
        });
      } else {
        const loadTime = performance.now() - startTime;
        console.log(`Demand matrix loaded successfully in ${loadTime.toFixed(2)}ms`);
        
        toast({
          title: "Demand matrix loaded",
          description: `${newDemandData.months.length} months × ${newDemandData.skills.length} ${groupingMode}s loaded`,
        });
      }

      // Apply performance optimization
      const optimizedData = DemandPerformanceOptimizer.optimizeFiltering(newDemandData, {
        skills: [],
        clients: [],
        timeHorizon: customDateRange ? {
          start: customDateRange.start,
          end: customDateRange.end
        } : undefined
      });

      setDemandData(optimizedData);
      setRetryCount(0); // Reset retry count on success
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load demand matrix data';
      setError(errorMessage);
      console.error('Error loading demand matrix data:', err);
      
      // Increment retry count for tracking
      setRetryCount(prev => prev + 1);
      
      toast({
        title: "Error loading demand matrix",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Phase 5: Real-time updates integration
  const { refreshData } = useDemandMatrixRealtime({
    onDataChange: loadDemandData,
    isEnabled: !isLoading && !error
  });

  // Demand-specific controls - Updated to include preferred staff
  const {
    selectedSkills,
    selectedClients,
    selectedPreferredStaff,
    monthRange,
    handleSkillToggle,
    handleClientToggle,
    handlePreferredStaffToggle,
    handleMonthRangeChange,
    handleReset,
    handleExport,
    availableSkills,
    availableClients,
    availablePreferredStaff,
    skillsLoading,
    clientsLoading,
    isAllSkillsSelected,
    isAllClientsSelected,
    isAllPreferredStaffSelected
  } = useDemandMatrixControls({
    demandData,
    groupingMode
  });

  // Phase 4: Handle drill-down cell clicks with error handling
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

  // Phase 4: Handle time horizon changes with performance optimization
  const handleTimeHorizonChange = (horizon: 'quarter' | 'half-year' | 'year' | 'custom') => {
    setTimeHorizon(horizon);
    
    // Clear cache when changing time horizon
    DemandMatrixService.clearCache();
    
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

  // NEW: Handle print/export dialog
  const handleShowPrintExport = () => {
    setShowPrintExportDialog(true);
  };

  // Enhanced retry with exponential backoff
  const handleRetryWithBackoff = async () => {
    const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Max 30 seconds
    
    if (retryCount > 0) {
      toast({
        title: "Retrying...",
        description: `Waiting ${backoffDelay / 1000}s before retry attempt ${retryCount + 1}`,
      });
      
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
    
    await loadDemandData();
  };

  // Load data on mount
  useEffect(() => {
    loadDemandData();
  }, []);

  // FIXED: Filter data based on controls and grouping mode with corrected logic
  const getFilteredData = () => {
    if (!demandData) return null;

    console.log(`🔧 [DEMAND MATRIX] Starting filter operation:`, {
      groupingMode,
      selectedSkillsCount: selectedSkills.length,
      availableSkillsCount: availableSkills.length,
      selectedClientsCount: selectedClients.length,
      availableClientsCount: availableClients.length,
      selectedPreferredStaffCount: selectedPreferredStaff.length,
      availablePreferredStaffCount: availablePreferredStaff.length,
      isAllSkillsSelected,
      isAllClientsSelected,
      isAllPreferredStaffSelected,
      monthRange
    });

    const filteredMonths = demandData.months.slice(monthRange.start, monthRange.end + 1);
    
    // FIXED: Create filters with correct "no active filtering" logic
    const filters = {
      // Only include skills filter if we're NOT selecting all skills
      skills: isAllSkillsSelected ? [] : selectedSkills,
      // Only include clients filter if we're NOT selecting all clients  
      clients: isAllClientsSelected ? [] : selectedClients,
      // Only include preferred staff filter if we're NOT selecting all preferred staff
      preferredStaff: isAllPreferredStaffSelected ? [] : selectedPreferredStaff,
      timeHorizon: {
        start: filteredMonths[0] ? new Date(filteredMonths[0].key) : new Date(),
        end: filteredMonths[filteredMonths.length - 1] ? new Date(filteredMonths[filteredMonths.length - 1].key) : new Date()
      }
    };

    console.log(`🎯 [DEMAND MATRIX] Applied filters:`, {
      skillsFilter: filters.skills.length === 0 ? 'ALL SKILLS (no filter)' : filters.skills,
      clientsFilter: filters.clients.length === 0 ? 'ALL CLIENTS (no filter)' : filters.clients,
      preferredStaffFilter: filters.preferredStaff.length === 0 ? 'ALL PREFERRED STAFF (no filter)' : filters.preferredStaff,
      timeHorizonFilter: `${filters.timeHorizon.start.toISOString().split('T')[0]} to ${filters.timeHorizon.end.toISOString().split('T')[0]}`
    });

    // Use the corrected performance optimizer
    const optimizedData = DemandPerformanceOptimizer.optimizeFiltering(demandData, filters);
    
    console.log(`📊 [DEMAND MATRIX] Filter results:`, {
      originalDataPoints: demandData.dataPoints.length,
      filteredDataPoints: optimizedData.dataPoints.length,
      originalSkills: demandData.skills.length,
      filteredSkills: optimizedData.skills.length,
      totalDemandHours: optimizedData.totalDemand || 0
    });

    // Handle grouping mode transformation
    if (groupingMode === 'client') {
      // Transform data for client-based view - use the optimized data
      const clientGroupedData = {
        ...optimizedData,
        skills: Array.from(new Set(
          optimizedData.dataPoints
            .flatMap(point => point.taskBreakdown?.map(task => task.clientName) || [])
            .filter(name => name && !name.includes('...'))
        )),
        dataPoints: optimizedData.dataPoints // Use the already filtered data points
      };

      console.log(`👥 [DEMAND MATRIX] Client grouping applied:`, {
        uniqueClients: clientGroupedData.skills.length,
        dataPointsAfterGrouping: clientGroupedData.dataPoints.length
      });

      return clientGroupedData;
    }

    return optimizedData;
  };

  const filteredData = getFilteredData();

  // Loading state with enhanced information
  if (isLoading || skillsLoading || clientsLoading) {
    return (
      <DemandMatrixErrorBoundary>
        <DemandMatrixLoadingState 
          className={className}
          groupingMode={groupingMode}
        />
      </DemandMatrixErrorBoundary>
    );
  }

  // Error state with retry capability
  if (error) {
    return (
      <DemandMatrixErrorBoundary>
        <DemandMatrixErrorState
          className={className}
          error={error}
          onRetry={handleRetryWithBackoff}
          groupingMode={groupingMode}
        />
      </DemandMatrixErrorBoundary>
    );
  }

  // No data state with enhanced guidance
  if (!filteredData || filteredData.dataPoints.length === 0) {
    return (
      <DemandMatrixErrorBoundary>
        <DemandMatrixEmptyState
          className={className}
          groupingMode={groupingMode}
          onRefresh={refreshData}
        />
      </DemandMatrixErrorBoundary>
    );
  }

  return (
    <DemandMatrixErrorBoundary>
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
              
              {/* Standard Controls Panel - FIXED: Added all required preferred staff props */}
              <DemandMatrixControlsPanel
                isControlsExpanded={isControlsExpanded}
                onToggleControls={() => setIsControlsExpanded(!isControlsExpanded)}
                selectedSkills={selectedSkills}
                selectedClients={selectedClients}
                selectedPreferredStaff={selectedPreferredStaff}
                onSkillToggle={handleSkillToggle}
                onClientToggle={handleClientToggle}
                onPreferredStaffToggle={handlePreferredStaffToggle}
                monthRange={monthRange}
                onMonthRangeChange={handleMonthRangeChange}
                onExport={handleShowExport}
                onReset={handleReset}
                groupingMode={groupingMode}
                availableSkills={availableSkills}
                availableClients={availableClients}
                availablePreferredStaff={availablePreferredStaff}
                isAllSkillsSelected={isAllSkillsSelected}
                isAllClientsSelected={isAllClientsSelected}
                isAllPreferredStaffSelected={isAllPreferredStaffSelected}
                onPrintExport={handleShowPrintExport}
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
                  onRefresh={refreshData}
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

        {/* Export Dialog - FIXED: Using correct prop interface */}
        {demandData && (
          <DemandMatrixExportDialog
            onExport={(config) => {
              // Handle export configuration
              handleExport(config);
              setShowExportDialog(false);
            }}
            groupingMode={groupingMode}
            selectedSkills={selectedSkills}
            selectedClients={selectedClients}
            selectedPreferredStaff={selectedPreferredStaff}
            monthRange={monthRange}
            availableSkills={availableSkills}
            availableClients={availableClients}
            availablePreferredStaff={availablePreferredStaff}
            isAllSkillsSelected={isAllSkillsSelected}
            isAllClientsSelected={isAllClientsSelected}
            isAllPreferredStaffSelected={isAllPreferredStaffSelected}
          >
            {showExportDialog && (
              <div className="hidden">Export Trigger</div>
            )}
          </DemandMatrixExportDialog>
        )}

        {/* Print/Export Dialog */}
        {demandData && (
          <DemandMatrixPrintExportDialog
            isOpen={showPrintExportDialog}
            onClose={() => setShowPrintExportDialog(false)}
            demandData={filteredData}
            selectedSkills={selectedSkills}
            selectedClients={selectedClients}
            monthRange={monthRange}
            groupingMode={groupingMode}
          />
        )}
      </div>
    </DemandMatrixErrorBoundary>
  );
};

export default DemandMatrix;
