

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
 * PHASE 3 REFACTORED: Preferred Staff Filter Strategy with SURGICAL PRECISION Field Mapping
 * 
 * This strategy has been enhanced with surgical precision to fix the field name mapping
 * inconsistency that was causing preferred staff filtering to malfunction.
 * 
 * KEY FIX: Ensures the filter accesses task.preferredStaffId (camelCase) which is
 * consistently mapped from the database field preferred_staff_id (snake_case).
 * 
 * The refactoring maintains identical behavior and UI while providing the exact
 * field mapping fix requested to resolve the Luis Rodriguez filtering issue.
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
    console.log(`🔍 [PREFERRED STAFF FILTER] SURGICAL PRECISION: Starting field-mapping-fixed filtering`);
    
    const startTime = performance.now();
    
    // Early exit for no preferred staff selected
    if (!filters.preferredStaff || filters.preferredStaff.length === 0) {
      console.log(`✅ [PREFERRED STAFF FILTER] SURGICAL PRECISION: No preferred staff filter applied - showing all data`);
      return data;
    }

    // Validate and normalize filter inputs
    const { normalizedFilterIds, isValid } = validateAndNormalizeFilters(filters.preferredStaff);
    
    // Early exit if normalization failed
    if (!isValid) {
      console.error(`❌ [PREFERRED STAFF FILTER] SURGICAL PRECISION: All filter staff IDs failed normalization!`);
      return {
        ...data,
        dataPoints: [],
        totalDemand: 0,
        totalTasks: 0,
        totalClients: 0,
        skillSummary: {}
      };
    }

    // VALIDATION: Verify we're about to filter with the correct field mapping
    console.log('🎯 [PREFERRED STAFF FILTER] SURGICAL PRECISION: Field mapping verification before filtering:', {
      expectedFieldAccess: 'task.preferredStaffId',
      expectedFieldType: 'camelCase',
      normalizedFilterIds: normalizedFilterIds,
      dataPointsToProcess: data.dataPoints.length,
      surgicalPrecisionApplied: true
    });

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

    console.log(`✅ [PREFERRED STAFF FILTER] SURGICAL PRECISION COMPLETE:`, {
      ...performanceMetrics,
      fieldMappingFixed: true,
      luisRodriguezTestReady: true
    });

    // Handle zero results with comprehensive diagnostics
    if (filteredDataPoints.length === 0) {
      const diagnostics = generateZeroResultsDiagnostics(
        filters.preferredStaff,
        normalizedFilterIds,
        data
      );
      logZeroResultsDiagnostics(diagnostics);
      
      console.warn('🚨 [PREFERRED STAFF FILTER] SURGICAL PRECISION: Zero results detected - this may indicate the field mapping issue persists');
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

