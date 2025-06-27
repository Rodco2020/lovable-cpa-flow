
import { DemandPerformanceOptimizer } from '@/services/forecasting/demand/performanceOptimizer';
import { DemandMatrixData } from '@/types/demand';
import { differenceInDays } from 'date-fns';
import { UseDemandMatrixFilteringProps, UseDemandMatrixFilteringResult } from './types';
import { 
  validateMonthRange, 
  createValidatedTimeHorizon, 
  normalizeMonths 
} from './validationUtils';
import {
  runFilteringDiagnostics,
  createFallbackDataset,
  logPhase1DataAnalysis,
  logOriginalDataAnalysis
} from './diagnosticsUtils';
import {
  transformForClientGrouping,
  logFilterResults,
  logFilterCreation
} from './dataTransformUtils';

/**
 * Enhanced Hook for managing demand matrix data filtering
 * 
 * Handles all filtering logic with improved time horizon handling to prevent 
 * "No Demand Data Available" issues. Features enhanced debugging and validation.
 * 
 * PHASE 1 LOGGING: Added comprehensive logging to trace preferred staff ID flow
 * 
 * This hook has been refactored into focused modules for improved maintainability:
 * - validationUtils: Month range validation and time horizon creation
 * - diagnosticsUtils: Debugging and diagnostic functions  
 * - dataTransformUtils: Data transformation and grouping utilities
 * 
 * All existing functionality is preserved with no changes to the public API.
 */
export const useDemandMatrixFiltering = (
  demandData: DemandMatrixData | null,
  demandMatrixControls: any,
  groupingMode: 'skill' | 'client'
): UseDemandMatrixFilteringResult => {
  // Enhanced filter data function with better time horizon handling
  const getFilteredData = () => {
    if (!demandData) {
      console.log(`🔧 [DEMAND MATRIX] No demand data available for filtering`);
      return null;
    }

    // PHASE 1 LOGGING: Log filtering operation start
    logPhase1DataAnalysis(demandData, demandMatrixControls, groupingMode);

    // Enhanced month range validation and handling
    const safeMonthRange = validateMonthRange(demandMatrixControls.monthRange, demandData.months.length);
    console.log(`🔍 [DEMAND MATRIX] Validated month range: ${safeMonthRange.start} to ${safeMonthRange.end}`);

    const filteredMonths = demandData.months.slice(safeMonthRange.start, safeMonthRange.end + 1);
    
    if (filteredMonths.length === 0) {
      console.warn(`⚠️ [DEMAND MATRIX] No months available after range filtering, using all months`);
      filteredMonths.push(...demandData.months);
    }

    // CRITICAL FIX: Ensure months have both key and label properties with proper typing
    const normalizedMonths = normalizeMonths(filteredMonths);

    console.log(`📅 [DEMAND MATRIX] Filtered months:`, normalizedMonths.map(m => m.key));

    // Enhanced time horizon creation with validation
    const timeHorizon = createValidatedTimeHorizon(normalizedMonths);
    console.log(`🕐 [DEMAND MATRIX] Created time horizon:`, {
      start: timeHorizon.start.toISOString(),
      end: timeHorizon.end.toISOString(),
      daysDifference: differenceInDays(timeHorizon.end, timeHorizon.start),
      monthsCovered: normalizedMonths.length
    });
    
    // Create enhanced filters with proper "no active filtering" logic and PHASE 1 LOGGING
    const filters = {
      skills: demandMatrixControls.isAllSkillsSelected ? [] : demandMatrixControls.selectedSkills,
      clients: demandMatrixControls.isAllClientsSelected ? [] : demandMatrixControls.selectedClients,
      preferredStaff: demandMatrixControls.isAllPreferredStaffSelected ? [] : demandMatrixControls.selectedPreferredStaff,
      timeHorizon
    };

    // PHASE 1 LOGGING: Log filter creation with staff ID analysis
    logFilterCreation(filters);

    // PHASE 1 LOGGING: Log original data structure with staff ID analysis
    logOriginalDataAnalysis(demandData);

    // Use the performance optimizer with enhanced filtering
    const optimizedData = DemandPerformanceOptimizer.optimizeFiltering(demandData, filters);
    
    // CRITICAL TYPE FIX: Create properly typed filtered data with guaranteed month structure
    const finalOptimizedData: DemandMatrixData = {
      ...optimizedData,
      months: normalizedMonths // Ensure months always have both key and label properties
    };
    
    // PHASE 1 LOGGING: Log optimization results with staff filtering analysis
    logFilterResults(demandData, finalOptimizedData, filters);

    // Enhanced safeguard with detailed diagnostics
    if (finalOptimizedData.dataPoints.length === 0) {
      console.error(`❌ [DEMAND MATRIX] All data was filtered out! Running diagnostics...`);
      runFilteringDiagnostics(demandData, filters, normalizedMonths);
      
      // Return a minimal dataset to prevent complete failure
      return createFallbackDataset(demandData, normalizedMonths);
    }

    // Handle grouping mode transformation
    if (groupingMode === 'client') {
      return transformForClientGrouping(finalOptimizedData);
    }

    return finalOptimizedData;
  };

  return {
    getFilteredData
  };
};
