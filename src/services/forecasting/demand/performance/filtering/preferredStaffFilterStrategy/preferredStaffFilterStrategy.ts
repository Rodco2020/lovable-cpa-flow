
import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { BaseFilterStrategy } from '../baseFilterStrategy';
import { 
  validateAndNormalizeFilters, 
  analyzeFilterData, 
  shouldProceedWithFiltering 
} from './validationUtils';
import { processDataPoint, calculateFilteredTotals } from './dataPointProcessor';
import { 
  generateZeroResultsDiagnostics, 
  logZeroResultsDiagnostics, 
  generatePerformanceMetrics 
} from './diagnosticsUtils';

/**
 * PHASE 3 REFACTORED: Preferred Staff Filter Strategy with Enhanced Modular Architecture
 * 
 * This strategy has been refactored from a monolithic 262-line implementation into
 * focused, maintainable modules while preserving 100% of the original functionality.
 * 
 * Key improvements:
 * - Separated concerns into focused utility modules
 * - Enhanced testability with isolated functions
 * - Improved maintainability with clear module boundaries
 * - Comprehensive documentation and type safety
 * - Preserved all existing logging and diagnostic capabilities
 * 
 * The refactoring maintains identical behavior and UI while providing better
 * code structure for long-term maintenance and extensibility.
 */
export class PreferredStaffFilterStrategy implements BaseFilterStrategy {
  getName(): string {
    return 'PreferredStaffFilter';
  }

  getPriority(): number {
    // Apply after skill, client and time horizon filters
    return 4;
  }

  shouldApply(filters: DemandFilters): boolean {
    return shouldProceedWithFiltering(filters);
  }

  apply(data: DemandMatrixData, filters: DemandFilters): DemandMatrixData {
    console.log(`🔍 [PREFERRED STAFF FILTER] PHASE 3: Starting enhanced normalized staff ID filtering`);
    
    const startTime = performance.now();
    
    // Early exit for no preferred staff selected
    if (!filters.preferredStaff || filters.preferredStaff.length === 0) {
      console.log(`✅ [PREFERRED STAFF FILTER] PHASE 3: No preferred staff filter applied - showing all data`);
      return data;
    }

    // Validate and normalize filter inputs
    const { normalizedFilterIds, isValid } = validateAndNormalizeFilters(filters.preferredStaff);
    
    // Early exit if normalization failed
    if (!isValid) {
      console.error(`❌ [PREFERRED STAFF FILTER] PHASE 3: All filter staff IDs failed normalization!`);
      return {
        ...data,
        dataPoints: [],
        totalDemand: 0,
        totalTasks: 0,
        totalClients: 0,
        skillSummary: {}
      };
    }

    // Analyze filter data for diagnostics
    const filterAnalysis = analyzeFilterData(data, normalizedFilterIds);

    // Process each data point with enhanced filtering
    const filteredDataPoints = data.dataPoints
      .map(dataPoint => {
        const { filteredDataPoint } = processDataPoint(dataPoint, normalizedFilterIds);
        return filteredDataPoint;
      })
      .filter(dataPoint => dataPoint.demandHours > 0); // Remove empty data points

    // Calculate totals and summaries for filtered data
    const { 
      totalDemand, 
      totalTasks, 
      totalClients, 
      skillSummary, 
      remainingSkills 
    } = calculateFilteredTotals(filteredDataPoints);

    const endTime = performance.now();
    const processingTime = endTime - startTime;

    // Generate performance metrics
    const performanceMetrics = generatePerformanceMetrics(
      processingTime,
      data,
      {
        ...data,
        dataPoints: filteredDataPoints,
        skills: remainingSkills,
        totalDemand,
        totalTasks,
        totalClients,
        skillSummary
      }
    );

    console.log(`✅ [PREFERRED STAFF FILTER] PHASE 3 COMPLETE:`, performanceMetrics);

    // Handle zero results with comprehensive diagnostics
    if (filteredDataPoints.length === 0) {
      const diagnostics = generateZeroResultsDiagnostics(
        filters.preferredStaff,
        normalizedFilterIds,
        data
      );
      logZeroResultsDiagnostics(diagnostics);
    }

    return {
      ...data,
      dataPoints: filteredDataPoints,
      skills: remainingSkills,
      totalDemand,
      totalTasks,
      totalClients,
      skillSummary
    };
  }
}
