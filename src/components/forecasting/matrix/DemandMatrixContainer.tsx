import React, { useEffect } from 'react';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';
import { DemandDrillDownService } from '@/services/forecasting/demand/demandDrillDownService';
import { DemandPerformanceOptimizer } from '@/services/forecasting/demand/performanceOptimizer';
import { useDemandMatrixControls } from './hooks/useDemandMatrixControls';
import { useDemandMatrixRealtime } from '@/hooks/useDemandMatrixRealtime';
import { useToast } from '@/components/ui/use-toast';
import { SkillType } from '@/types/task';
import { useDemandMatrixState } from './DemandMatrixStateProvider';
import { DemandMatrixPresentation } from './DemandMatrixPresentation';

interface DemandMatrixContainerProps {
  className?: string;
  groupingMode: 'skill' | 'client';
}

/**
 * Container component that handles all business logic and data operations
 * for the Demand Matrix. This component orchestrates data fetching, state management,
 * and business logic while delegating UI rendering to the presentation component.
 */
export const DemandMatrixContainer: React.FC<DemandMatrixContainerProps> = ({
  className,
  groupingMode
}) => {
  const { toast } = useToast();
  const {
    demandData,
    isLoading,
    error,
    validationIssues,
    isControlsExpanded,
    retryCount,
    drillDownData,
    selectedDrillDown,
    showExportDialog,
    showPrintExportDialog,
    timeHorizon,
    customDateRange,
    setDemandData,
    setIsLoading,
    setError,
    setValidationIssues,
    setIsControlsExpanded,
    setRetryCount,
    setDrillDownData,
    setSelectedDrillDown,
    setShowExportDialog,
    setShowPrintExportDialog,
    setTimeHorizon,
    setCustomDateRange,
  } = useDemandMatrixState();

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

  // Demand-specific controls
  const demandMatrixControls = useDemandMatrixControls({
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
        demandMatrixControls.handleMonthRangeChange({ start: 0, end: 2 });
        break;
      case 'half-year':
        demandMatrixControls.handleMonthRangeChange({ start: 0, end: 5 });
        break;
      case 'year':
        demandMatrixControls.handleMonthRangeChange({ start: 0, end: 11 });
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
      selectedSkillsCount: demandMatrixControls.selectedSkills.length,
      availableSkillsCount: demandMatrixControls.availableSkills.length,
      selectedClientsCount: demandMatrixControls.selectedClients.length,
      availableClientsCount: demandMatrixControls.availableClients.length,
      isAllSkillsSelected: demandMatrixControls.isAllSkillsSelected,
      isAllClientsSelected: demandMatrixControls.isAllClientsSelected,
      monthRange: demandMatrixControls.monthRange
    });

    const filteredMonths = demandData.months.slice(demandMatrixControls.monthRange.start, demandMatrixControls.monthRange.end + 1);
    
    // FIXED: Create filters with correct "no active filtering" logic
    const filters = {
      // Only include skills filter if we're NOT selecting all skills
      skills: demandMatrixControls.isAllSkillsSelected ? [] : demandMatrixControls.selectedSkills,
      // Only include clients filter if we're NOT selecting all clients  
      clients: demandMatrixControls.isAllClientsSelected ? [] : demandMatrixControls.selectedClients,
      timeHorizon: {
        start: filteredMonths[0] ? new Date(filteredMonths[0].key) : new Date(),
        end: filteredMonths[filteredMonths.length - 1] ? new Date(filteredMonths[filteredMonths.length - 1].key) : new Date()
      }
    };

    console.log(`🎯 [DEMAND MATRIX] Applied filters:`, {
      skillsFilter: filters.skills.length === 0 ? 'ALL SKILLS (no filter)' : filters.skills,
      clientsFilter: filters.clients.length === 0 ? 'ALL CLIENTS (no filter)' : filters.clients,
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

  // Prepare all handlers and data for the presentation component
  const presentationProps = {
    className,
    groupingMode,
    demandData,
    filteredData,
    isLoading,
    error,
    validationIssues,
    isControlsExpanded,
    retryCount,
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
    onCustomDateRangeChange: setCustomDateRange,
    onShowExport: handleShowExport,
    onShowPrintExport: handleShowPrintExport,
    onCloseDrillDown: () => {
      setDrillDownData(null);
      setSelectedDrillDown(null);
    },
    onCloseExportDialog: () => setShowExportDialog(false),
    onClosePrintExportDialog: () => setShowPrintExportDialog(false),
  };

  return <DemandMatrixPresentation {...presentationProps} />;
};
