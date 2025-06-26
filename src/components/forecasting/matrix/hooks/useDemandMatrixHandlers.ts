import { DemandDrillDownService } from '@/services/forecasting/demand/demandDrillDownService';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';
import { SkillType } from '@/types/task';
import { useToast } from '@/components/ui/use-toast';
import { useDemandMatrixState } from '../DemandMatrixStateProvider';
import { differenceInDays, startOfMonth, endOfMonth, addMonths } from 'date-fns';

/**
 * Hook for managing demand matrix event handlers
 * 
 * Handles all user interactions including drill-down, time horizon changes,
 * export dialogs, and modal management.
 * 
 * Enhanced with better time horizon validation and debugging.
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

  // Enhanced time horizon change handler with validation and debugging
  const handleTimeHorizonChange = (horizon: 'quarter' | 'half-year' | 'year' | 'custom') => {
    console.log(`🕐 [TIME HORIZON] Changing from ${timeHorizon} to ${horizon}`);
    
    setTimeHorizon(horizon);
    
    // Clear cache when changing time horizon
    DemandMatrixService.clearCache();
    
    // Calculate proper month ranges based on horizon
    const now = new Date();
    let monthRange: { start: number; end: number };
    let calculatedCustomRange: { start: Date; end: Date } | undefined;

    switch (horizon) {
      case 'quarter':
        monthRange = { start: 0, end: 2 }; // 3 months
        calculatedCustomRange = {
          start: startOfMonth(now),
          end: endOfMonth(addMonths(now, 2))
        };
        break;
      case 'half-year':
        monthRange = { start: 0, end: 5 }; // 6 months
        calculatedCustomRange = {
          start: startOfMonth(now),
          end: endOfMonth(addMonths(now, 5))
        };
        break;
      case 'year':
        monthRange = { start: 0, end: 11 }; // 12 months
        calculatedCustomRange = {
          start: startOfMonth(now),
          end: endOfMonth(addMonths(now, 11))
        };
        break;
      case 'custom':
        // Keep current range until custom dates are set
        monthRange = demandMatrixControls.monthRange || { start: 0, end: 11 };
        // Don't set calculatedCustomRange for custom - user will set it
        break;
    }

    console.log(`📅 [TIME HORIZON] Setting month range:`, monthRange);
    demandMatrixControls.handleMonthRangeChange(monthRange);

    // Set calculated custom range for non-custom horizons
    if (horizon !== 'custom' && calculatedCustomRange) {
      console.log(`📅 [TIME HORIZON] Setting calculated date range:`, {
        start: calculatedCustomRange.start.toISOString(),
        end: calculatedCustomRange.end.toISOString(),
        daysDifference: differenceInDays(calculatedCustomRange.end, calculatedCustomRange.start)
      });
      setCustomDateRange(calculatedCustomRange);
    }

    toast({
      title: "Time horizon updated",
      description: `Switched to ${horizon === 'custom' ? 'custom range' : `${horizon.replace('-', ' ')} view`}`,
    });
  };

  // Handle export dialog
  const handleShowExport = () => {
    setShowExportDialog(true);
  };

  // Handle print/export dialog
  const handleShowPrintExport = () => {
    setShowPrintExportDialog(true);
  };

  // Enhanced custom date range change handler with validation
  const handleCustomDateRangeChange = (range: {start: Date; end: Date} | undefined) => {
    if (!range) {
      console.log(`📅 [CUSTOM RANGE] Clearing custom date range`);
      setCustomDateRange(undefined);
      return;
    }

    const daysDiff = differenceInDays(range.end, range.start);
    
    console.log(`📅 [CUSTOM RANGE] Setting custom date range:`, {
      start: range.start.toISOString(),
      end: range.end.toISOString(),
      daysDifference: daysDiff
    });

    // Validate the range
    if (daysDiff < 0) {
      console.warn(`⚠️ [CUSTOM RANGE] Invalid range: end date before start date`);
      toast({
        title: "Invalid date range",
        description: "End date must be after start date",
        variant: "destructive"
      });
      return;
    }

    if (daysDiff === 0) {
      console.warn(`⚠️ [CUSTOM RANGE] Single-day range detected, will be expanded to monthly boundaries`);
      toast({
        title: "Range adjusted",
        description: "Single-day ranges are expanded to monthly boundaries for better data matching",
        variant: "default"
      });
    }

    setCustomDateRange(range);

    // Clear cache to force recalculation with new range
    DemandMatrixService.clearCache();
  };

  return {
    handleCellClick,
    handleTimeHorizonChange,
    handleShowExport,
    handleShowPrintExport,
    handleCustomDateRangeChange
  };
};
