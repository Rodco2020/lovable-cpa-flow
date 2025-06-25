import { DemandDrillDownService } from '@/services/forecasting/demand/demandDrillDownService';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';
import { SkillType } from '@/types/task';
import { useToast } from '@/components/ui/use-toast';
import { useDemandMatrixState } from '../DemandMatrixStateProvider';

/**
 * Hook for managing demand matrix event handlers
 * 
 * Handles all user interactions including drill-down, time horizon changes,
 * export dialogs, and modal management.
 */
export const useDemandMatrixHandlers = (
  demandData: any,
  demandMatrixControls: any
) => {
  const { toast } = useToast();
  const {
    timeHorizon,
    setSelectedDrillDown,
    setDrillDownData,
    setTimeHorizon,
    setShowExportDialog,
    setShowPrintExportDialog,
    setCustomDateRange,
  } = useDemandMatrixState();

  // Handle drill-down cell clicks with error handling
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

  // Handle time horizon changes with performance optimization
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

  // Handle export dialog
  const handleShowExport = () => {
    setShowExportDialog(true);
  };

  // Handle print/export dialog
  const handleShowPrintExport = () => {
    setShowPrintExportDialog(true);
  };

  // Handle custom date range changes
  const handleCustomDateRangeChange = (range: {start: Date; end: Date} | undefined) => {
    setCustomDateRange(range);
  };

  return {
    handleCellClick,
    handleTimeHorizonChange,
    handleShowExport,
    handleShowPrintExport,
    handleCustomDateRangeChange
  };
};
