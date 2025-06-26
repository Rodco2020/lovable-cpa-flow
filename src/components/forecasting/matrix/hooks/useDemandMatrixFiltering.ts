import { DemandPerformanceOptimizer } from '@/services/forecasting/demand/performanceOptimizer';
import { DemandMatrixData } from '@/types/demand';
import { startOfMonth, endOfMonth, differenceInDays, addDays, format } from 'date-fns';

/**
 * Enhanced Hook for managing demand matrix data filtering
 * 
 * Handles all filtering logic with improved time horizon handling to prevent 
 * "No Demand Data Available" issues. Features enhanced debugging and validation.
 */
export const useDemandMatrixFiltering = (
  demandData: DemandMatrixData | null,
  demandMatrixControls: any,
  groupingMode: 'skill' | 'client'
) => {
  // Enhanced filter data function with better time horizon handling
  const getFilteredData = () => {
    if (!demandData) {
      console.log(`🔧 [DEMAND MATRIX] No demand data available for filtering`);
      return null;
    }

    console.log(`🔧 [DEMAND MATRIX] Starting enhanced filter operation:`, {
      groupingMode,
      selectedSkillsCount: demandMatrixControls.selectedSkills.length,
      availableSkillsCount: demandMatrixControls.availableSkills.length,
      selectedClientsCount: demandMatrixControls.selectedClients.length,
      availableClientsCount: demandMatrixControls.availableClients.length,
      selectedPreferredStaffCount: demandMatrixControls.selectedPreferredStaff.length,
      availablePreferredStaffCount: demandMatrixControls.availablePreferredStaff.length,
      isAllSkillsSelected: demandMatrixControls.isAllSkillsSelected,
      isAllClientsSelected: demandMatrixControls.isAllClientsSelected,
      isAllPreferredStaffSelected: demandMatrixControls.isAllPreferredStaffSelected,
      monthRange: demandMatrixControls.monthRange,
      originalDataPoints: demandData.dataPoints.length,
      availableMonths: demandData.months.length
    });

    // Enhanced month range validation and handling
    const safeMonthRange = validateMonthRange(demandMatrixControls.monthRange, demandData.months.length);
    console.log(`🔍 [DEMAND MATRIX] Validated month range: ${safeMonthRange.start} to ${safeMonthRange.end}`);

    const filteredMonths = demandData.months.slice(safeMonthRange.start, safeMonthRange.end + 1);
    
    if (filteredMonths.length === 0) {
      console.warn(`⚠️ [DEMAND MATRIX] No months available after range filtering, using all months`);
      filteredMonths.push(...demandData.months);
    }

    // CRITICAL FIX: Ensure months have both key and label properties with proper typing
    const normalizedMonths: Array<{ key: string; label: string }> = filteredMonths.map(month => ({
      key: month.key,
      label: month.label || format(new Date(month.key + '-01'), 'MMM yyyy')
    }));

    console.log(`📅 [DEMAND MATRIX] Filtered months:`, normalizedMonths.map(m => m.key));

    // Enhanced time horizon creation with validation
    const timeHorizon = createValidatedTimeHorizon(normalizedMonths);
    console.log(`🕐 [DEMAND MATRIX] Created time horizon:`, {
      start: timeHorizon.start.toISOString(),
      end: timeHorizon.end.toISOString(),
      daysDifference: differenceInDays(timeHorizon.end, timeHorizon.start),
      monthsCovered: normalizedMonths.length
    });
    
    // Create enhanced filters with proper "no active filtering" logic
    const filters = {
      skills: demandMatrixControls.isAllSkillsSelected ? [] : demandMatrixControls.selectedSkills,
      clients: demandMatrixControls.isAllClientsSelected ? [] : demandMatrixControls.selectedClients,
      preferredStaff: demandMatrixControls.isAllPreferredStaffSelected ? [] : demandMatrixControls.selectedPreferredStaff,
      timeHorizon
    };

    console.log(`🎯 [DEMAND MATRIX] Applied enhanced filters:`, {
      skillsFilter: filters.skills.length === 0 ? 'ALL SKILLS (no filter)' : filters.skills,
      clientsFilter: filters.clients.length === 0 ? 'ALL CLIENTS (no filter)' : filters.clients,
      preferredStaffFilter: filters.preferredStaff.length === 0 ? 'ALL STAFF (no filter)' : filters.preferredStaff,
      timeHorizonFilter: `${filters.timeHorizon.start.toISOString().split('T')[0]} to ${filters.timeHorizon.end.toISOString().split('T')[0]}`,
      timeHorizonDays: differenceInDays(filters.timeHorizon.end, filters.timeHorizon.start)
    });

    // Use the performance optimizer with enhanced filtering
    const optimizedData = DemandPerformanceOptimizer.optimizeFiltering(demandData, filters);
    
    // CRITICAL TYPE FIX: Create properly typed filtered data with guaranteed month structure
    const finalOptimizedData: DemandMatrixData = {
      ...optimizedData,
      months: normalizedMonths // Ensure months always have both key and label properties
    };
    
    console.log(`📊 [DEMAND MATRIX] Enhanced filter results:`, {
      originalDataPoints: demandData.dataPoints.length,
      filteredDataPoints: finalOptimizedData.dataPoints.length,
      originalSkills: demandData.skills.length,
      filteredSkills: finalOptimizedData.skills.length,
      monthsWithLabels: finalOptimizedData.months.length,
      sampleMonth: finalOptimizedData.months[0], // Log sample month to verify structure
      totalDemandHours: finalOptimizedData.totalDemand || 0,
      totalTasks: finalOptimizedData.totalTasks,
      totalClients: finalOptimizedData.totalClients,
      preferredStaffFilterApplied: filters.preferredStaff.length > 0,
      filteringEfficiency: `${((finalOptimizedData.dataPoints.length / demandData.dataPoints.length) * 100).toFixed(1)}%`
    });

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

/**
 * Validate and correct month range to prevent out-of-bounds access
 */
function validateMonthRange(monthRange: { start: number; end: number }, maxMonths: number) {
  const safeStart = Math.max(0, Math.min(monthRange.start, maxMonths - 1));
  const safeEnd = Math.max(safeStart, Math.min(monthRange.end, maxMonths - 1));
  
  if (safeStart !== monthRange.start || safeEnd !== monthRange.end) {
    console.warn(`⚠️ [DEMAND MATRIX] Month range adjusted from [${monthRange.start}, ${monthRange.end}] to [${safeStart}, ${safeEnd}]`);
  }
  
  return { start: safeStart, end: safeEnd };
}

/**
 * Create a validated time horizon that prevents filtering issues
 */
function createValidatedTimeHorizon(filteredMonths: Array<{ key: string; label: string }>) {
  try {
    if (filteredMonths.length === 0) {
      // Fallback to current month
      const now = new Date();
      return {
        start: startOfMonth(now),
        end: endOfMonth(now)
      };
    }

    // Use month boundaries for better data matching
    const startDate = startOfMonth(new Date(filteredMonths[0].key + '-01'));
    const endDate = endOfMonth(new Date(filteredMonths[filteredMonths.length - 1].key + '-01'));
    
    // Validate the range
    const daysDiff = differenceInDays(endDate, startDate);
    
    if (daysDiff < 0) {
      console.warn(`⚠️ [TIME HORIZON] Invalid range detected, swapping dates`);
      return { start: endDate, end: startDate };
    }
    
    if (daysDiff === 0) {
      console.warn(`⚠️ [TIME HORIZON] Single-day range, expanding to monthly boundaries`);
      return {
        start: startDate,
        end: endOfMonth(addDays(startDate, 30))
      };
    }
    
    return { start: startDate, end: endDate };
  } catch (error) {
    console.error(`❌ [TIME HORIZON] Error creating time horizon:`, error);
    const now = new Date();
    return {
      start: startOfMonth(now),
      end: endOfMonth(now)
    };
  }
}

/**
 * Run detailed diagnostics when filtering removes all data
 */
function runFilteringDiagnostics(
  originalData: DemandMatrixData, 
  filters: any, 
  filteredMonths: Array<{ key: string; label: string }>
) {
  console.log(`🔍 [FILTERING DIAGNOSTICS] Analyzing why all data was filtered out:`);
  console.log(`📊 Original data summary:`, {
    totalDataPoints: originalData.dataPoints.length,
    availableMonths: originalData.months.map(m => m.key),
    availableSkills: originalData.skills,
    sampleDataPoints: originalData.dataPoints.slice(0, 5).map(dp => ({
      month: dp.month,
      skillType: dp.skillType,
      demandHours: dp.demandHours,
      taskCount: dp.taskBreakdown?.length || 0
    }))
  });
  
  console.log(`🎯 Applied filters:`, {
    skills: filters.skills.length === 0 ? 'No skill filtering' : filters.skills,
    clients: filters.clients.length === 0 ? 'No client filtering' : filters.clients,
    timeHorizon: `${filters.timeHorizon.start.toISOString()} to ${filters.timeHorizon.end.toISOString()}`,
    filteredMonthKeys: filteredMonths.map(m => m.key)
  });
}

/**
 * Create a fallback dataset when all data is filtered out
 */
function createFallbackDataset(originalData: DemandMatrixData, filteredMonths: Array<{ key: string; label: string }>): DemandMatrixData {
  console.log(`🔧 [FALLBACK] Creating minimal dataset to prevent complete failure`);
  
  return {
    ...originalData,
    months: filteredMonths.length > 0 ? filteredMonths : originalData.months.slice(0, 1),
    dataPoints: [], // Empty but valid
    totalDemand: 0,
    totalTasks: 0,
    totalClients: 0
  };
}

/**
 * Transform data for client-based grouping view
 */
function transformForClientGrouping(optimizedData: DemandMatrixData): DemandMatrixData {
  const clientGroupedData = {
    ...optimizedData,
    skills: Array.from(new Set(
      optimizedData.dataPoints
        .flatMap(point => point.taskBreakdown?.map(task => task.clientName) || [])
        .filter(name => name && !name.includes('...'))
    )),
    dataPoints: optimizedData.dataPoints
  };

  console.log(`👥 [DEMAND MATRIX] Client grouping applied:`, {
    uniqueClients: clientGroupedData.skills.length,
    dataPointsAfterGrouping: clientGroupedData.dataPoints.length
  });

  return clientGroupedData;
}
