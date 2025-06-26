import { DemandDrillDownService } from '@/services/forecasting/demand/demandDrillDownService';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';
import { SkillType } from '@/types/task';
import { useToast } from '@/components/ui/use-toast';
import { useDemandMatrixState } from '../DemandMatrixStateProvider';
import { differenceInDays, startOfMonth, endOfMonth, addMonths } from 'date-fns';

/**
 * Enhanced Hook for managing demand matrix event handlers
 * 
 * FIXED: Month range calculation to ensure proper 12-month data generation
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

  // FIXED: Enhanced time horizon change handler with proper 12-month calculation
  const handleTimeHorizonChange = (horizon: 'quarter' | 'half-year' | 'year' | 'custom') => {
    console.log(`🕐 [TIME HORIZON] FIXED Enhanced change from ${timeHorizon} to ${horizon}`);
    
    // Clear cache before making changes
    DemandMatrixService.clearCache();
    
    setTimeHorizon(horizon);
    
    // CRITICAL FIX: Calculate proper month ranges for 12-month display
    const now = new Date();
    const { monthRange, calculatedCustomRange } = calculateFixedTimeHorizon(horizon, now);

    console.log(`📅 [TIME HORIZON] FIXED calculation results:`, {
      horizon,
      monthRange,
      monthRangeSpan: monthRange.end - monthRange.start + 1,
      calculatedCustomRange: calculatedCustomRange ? {
        start: calculatedCustomRange.start.toISOString(),
        end: calculatedCustomRange.end.toISOString(),
        daysDifference: differenceInDays(calculatedCustomRange.end, calculatedCustomRange.start),
        monthsDifference: Math.round(differenceInDays(calculatedCustomRange.end, calculatedCustomRange.start) / 30)
      } : null
    });

    // Apply month range - this is critical for 12-month display
    demandMatrixControls.handleMonthRangeChange(monthRange);

    // Set calculated custom range for non-custom horizons
    if (horizon !== 'custom' && calculatedCustomRange) {
      setCustomDateRange(calculatedCustomRange);
      
      console.log(`✅ [TIME HORIZON] FIXED Applied calculated date range for ${horizon}:`, {
        start: calculatedCustomRange.start.toISOString(),
        end: calculatedCustomRange.end.toISOString(),
        expectedMonths: horizon === 'year' ? 12 : horizon === 'half-year' ? 6 : 3
      });
    }

    toast({
      title: "Time horizon updated",
      description: `Switched to ${horizon === 'custom' ? 'custom range' : `${horizon.replace('-', ' ')} view`} - ${horizon === 'year' ? '12 months' : horizon === 'half-year' ? '6 months' : '3 months'}`,
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
 * FIXED: Calculate proper time horizon ensuring 12 months for year view
 */
function calculateFixedTimeHorizon(
  horizon: 'quarter' | 'half-year' | 'year' | 'custom',
  baseDate: Date
) {
  let monthRange: { start: number; end: number };
  let calculatedCustomRange: { start: Date; end: Date } | undefined;

  console.log(`🔧 [TIME HORIZON] FIXED calculation for ${horizon}`);

  switch (horizon) {
    case 'quarter':
      monthRange = { start: 0, end: 2 }; // 3 months (indices 0, 1, 2)
      calculatedCustomRange = {
        start: startOfMonth(baseDate),
        end: endOfMonth(addMonths(baseDate, 2))
      };
      break;
    case 'half-year':
      monthRange = { start: 0, end: 5 }; // 6 months (indices 0-5)
      calculatedCustomRange = {
        start: startOfMonth(baseDate),
        end: endOfMonth(addMonths(baseDate, 5))
      };
      break;
    case 'year':
      // CRITICAL FIX: Ensure 12 months are properly indexed
      monthRange = { start: 0, end: 11 }; // 12 months (indices 0-11)
      calculatedCustomRange = {
        start: startOfMonth(baseDate),
        end: endOfMonth(addMonths(baseDate, 11)) // 12 months total
      };
      console.log(`📅 [YEAR HORIZON] FIXED: Setting 12-month range:`, {
        monthRange,
        startDate: startOfMonth(baseDate).toISOString(),
        endDate: endOfMonth(addMonths(baseDate, 11)).toISOString(),
        totalMonths: 12
      });
      break;
    case 'custom':
      // Keep current range until custom dates are set
      monthRange = { start: 0, end: 11 }; // Default to year view
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
