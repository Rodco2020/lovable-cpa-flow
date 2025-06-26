import { DemandDrillDownService } from '@/services/forecasting/demand/demandDrillDownService';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';
import { SkillType } from '@/types/task';
import { useToast } from '@/components/ui/use-toast';
import { useDemandMatrixState } from '../DemandMatrixStateProvider';
import { differenceInDays, startOfMonth, endOfMonth, addMonths } from 'date-fns';

/**
 * Enhanced Hook for managing demand matrix event handlers
 * 
 * Handles all user interactions with improved time horizon management,
 * better validation, and enhanced debugging capabilities.
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

  // Handle drill-down cell clicks with enhanced error handling
  const handleCellClick = async (skill: SkillType, month: string) => {
    if (!demandData) {
      console.warn(`⚠️ [CELL CLICK] No demand data available for drill-down`);
      return;
    }
    
    try {
      console.log(`🖱️ [CELL CLICK] Processing drill-down for:`, { skill, month });
      setSelectedDrillDown({ skill, month });
      
      const drillDown = DemandDrillDownService.generateDrillDownData(demandData, skill, month);
      setDrillDownData(drillDown);
      
      console.log(`✅ [CELL CLICK] Drill-down data generated successfully:`, {
        tasksCount: drillDown.tasks?.length || 0,
        totalHours: drillDown.totalHours || 0
      });
    } catch (err) {
      console.error(`❌ [CELL CLICK] Error generating drill-down data:`, err);
      toast({
        title: "Error loading details",
        description: "Failed to load drill-down data for this cell",
        variant: "destructive"
      });
    }
  };

  // Enhanced time horizon change handler with comprehensive validation
  const handleTimeHorizonChange = (horizon: 'quarter' | 'half-year' | 'year' | 'custom') => {
    console.log(`🕐 [TIME HORIZON] Enhanced change from ${timeHorizon} to ${horizon}`);
    
    // Clear cache before making changes
    DemandMatrixService.clearCache();
    
    setTimeHorizon(horizon);
    
    // Calculate enhanced month ranges and date ranges
    const now = new Date();
    const { monthRange, calculatedCustomRange } = calculateEnhancedTimeHorizon(horizon, now);

    console.log(`📅 [TIME HORIZON] Enhanced calculation results:`, {
      horizon,
      monthRange,
      calculatedCustomRange: calculatedCustomRange ? {
        start: calculatedCustomRange.start.toISOString(),
        end: calculatedCustomRange.end.toISOString(),
        daysDifference: differenceInDays(calculatedCustomRange.end, calculatedCustomRange.start)
      } : null
    });

    // Apply month range
    demandMatrixControls.handleMonthRangeChange(monthRange);

    // Set calculated custom range for non-custom horizons
    if (horizon !== 'custom' && calculatedCustomRange) {
      setCustomDateRange(calculatedCustomRange);
      
      console.log(`✅ [TIME HORIZON] Applied calculated date range:`, {
        start: calculatedCustomRange.start.toISOString(),
        end: calculatedCustomRange.end.toISOString(),
        monthsCovered: differenceInDays(calculatedCustomRange.end, calculatedCustomRange.start) / 30
      });
    }

    toast({
      title: "Time horizon updated",
      description: `Switched to ${horizon === 'custom' ? 'custom range' : `${horizon.replace('-', ' ')} view`}`,
    });
  };

  // Enhanced custom date range change handler with validation and auto-correction
  const handleCustomDateRangeChange = (range: {start: Date; end: Date} | undefined) => {
    if (!range) {
      console.log(`📅 [CUSTOM RANGE] Clearing custom date range`);
      setCustomDateRange(undefined);
      return;
    }

    console.log(`📅 [CUSTOM RANGE] Processing custom date range change:`, {
      originalStart: range.start.toISOString(),
      originalEnd: range.end.toISOString()
    });

    // Enhanced validation and auto-correction
    const validatedRange = validateAndCorrectDateRange(range);
    
    if (!validatedRange) {
      console.error(`❌ [CUSTOM RANGE] Range validation failed completely`);
      toast({
        title: "Invalid date range",
        description: "Unable to create a valid date range from the selected dates",
        variant: "destructive"
      });
      return;
    }

    const finalRange = validatedRange.corrected || validatedRange.original;
    
    // Log validation results
    console.log(`🔍 [CUSTOM RANGE] Validation results:`, {
      wasChanged: !!validatedRange.corrected,
      finalRange: {
        start: finalRange.start.toISOString(),
        end: finalRange.end.toISOString(),
        daysDifference: differenceInDays(finalRange.end, finalRange.start)
      },
      warnings: validatedRange.warnings
    });

    // Show warnings to user if range was modified
    if (validatedRange.corrected && validatedRange.warnings.length > 0) {
      toast({
        title: "Date range adjusted",
        description: validatedRange.warnings[0],
        variant: "default"
      });
    }

    setCustomDateRange(finalRange);
    
    // Clear cache to force recalculation with new range
    DemandMatrixService.clearCache();
    
    console.log(`✅ [CUSTOM RANGE] Successfully set custom date range`);
  };

  // Handle export dialog
  const handleShowExport = () => {
    console.log(`📤 [EXPORT] Opening export dialog`);
    setShowExportDialog(true);
  };

  // Handle print/export dialog
  const handleShowPrintExport = () => {
    console.log(`🖨️ [PRINT EXPORT] Opening print/export dialog`);
    setShowPrintExportDialog(true);
  };

  return {
    handleCellClick,
    handleTimeHorizonChange,
    handleShowExport,
    handleShowPrintExport,
    handleCustomDateRangeChange
  };
};

/**
 * Calculate enhanced time horizon with better validation
 */
function calculateEnhancedTimeHorizon(
  horizon: 'quarter' | 'half-year' | 'year' | 'custom',
  baseDate: Date
) {
  let monthRange: { start: number; end: number };
  let calculatedCustomRange: { start: Date; end: Date } | undefined;

  switch (horizon) {
    case 'quarter':
      monthRange = { start: 0, end: 2 }; // 3 months
      calculatedCustomRange = {
        start: startOfMonth(baseDate),
        end: endOfMonth(addMonths(baseDate, 2))
      };
      break;
    case 'half-year':
      monthRange = { start: 0, end: 5 }; // 6 months
      calculatedCustomRange = {
        start: startOfMonth(baseDate),
        end: endOfMonth(addMonths(baseDate, 5))
      };
      break;
    case 'year':
      monthRange = { start: 0, end: 11 }; // 12 months
      calculatedCustomRange = {
        start: startOfMonth(baseDate),
        end: endOfMonth(addMonths(baseDate, 11))
      };
      break;
    case 'custom':
      // Keep current range until custom dates are set
      monthRange = { start: 0, end: 11 }; // Default to year view
      // Don't set calculatedCustomRange for custom - user will set it
      break;
  }

  return { monthRange, calculatedCustomRange };
}

/**
 * Validate and correct date range with detailed feedback
 */
function validateAndCorrectDateRange(range: { start: Date; end: Date }) {
  const warnings: string[] = [];
  let corrected: { start: Date; end: Date } | null = null;

  const daysDiff = differenceInDays(range.end, range.start);
  
  // Handle invalid range (end before start)
  if (daysDiff < 0) {
    warnings.push("End date was before start date - dates have been swapped");
    corrected = { start: range.end, end: range.start };
    return { original: range, corrected, warnings };
  }

  // Handle single-day range
  if (daysDiff === 0) {
    warnings.push("Single-day ranges are expanded to monthly boundaries for better data matching");
    corrected = {
      start: startOfMonth(range.start),
      end: endOfMonth(range.start)
    };
    return { original: range, corrected, warnings };
  }

  // Handle very short ranges (less than a week)
  if (daysDiff < 7) {
    warnings.push("Very short ranges are expanded for meaningful forecasting");
    corrected = {
      start: startOfMonth(range.start),
      end: endOfMonth(addMonths(range.start, 1))
    };
    return { original: range, corrected, warnings };
  }

  // Range is acceptable as-is
  return { original: range, corrected: null, warnings: [] };
}
