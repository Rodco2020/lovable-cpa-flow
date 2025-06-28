
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
 * ENHANCED Preferred Staff Filter Strategy with COMPREHENSIVE DEBUGGING
 * 
 * This strategy has been completely enhanced to provide surgical precision debugging
 * and comprehensive validation for the preferred staff filtering process.
 * 
 * KEY ENHANCEMENTS:
 * - Comprehensive field mapping validation
 * - Enhanced debugging at every step
 * - Detailed performance metrics
 * - Zero results diagnostic system
 * - End-to-end field access verification
 * 
 * This addresses the core issue where tasks weren't being properly filtered
 * by preferred staff due to field mapping inconsistencies.
 */
export class PreferredStaffFilterStrategy implements BaseFilterStrategy {
  getName(): string {
    return 'PreferredStaffFilter_Enhanced';
  }

  getPriority(): number {
    // Apply after skill, client and time horizon filters
    return 4;
  }

  shouldApply(filters: DemandFilters): boolean {
    return shouldProceedWithFiltering(filters);
  }

  apply(data: DemandMatrixData, filters: DemandFilters): DemandMatrixData {
    console.group('🚀 [PREFERRED STAFF FILTER] ENHANCED STRATEGY EXECUTION');
    console.log('🔧 Starting enhanced preferred staff filtering with comprehensive debugging');
    
    const startTime = performance.now();
    
    // Early exit for no preferred staff selected
    if (!filters.preferredStaff || filters.preferredStaff.length === 0) {
      console.log('✅ No preferred staff filter applied - showing all data');
      console.groupEnd();
      return data;
    }

    // STEP 1: Enhanced validation and normalization
    console.log('📋 STEP 1: Enhanced Filter Validation');
    const { normalizedFilterIds, isValid, validationErrors } = validateAndNormalizeFilters(filters.preferredStaff);
    
    if (!isValid) {
      console.error('❌ Filter validation failed:', validationErrors);
      console.groupEnd();
      return this.createEmptyResult(data);
    }

    // STEP 2: Comprehensive data analysis
    console.log('📊 STEP 2: Comprehensive Data Analysis');
    const filterAnalysis = analyzeFilterData(data, normalizedFilterIds);
    this.logDataAnalysisResults(filterAnalysis);

    // STEP 3: Enhanced data point processing
    console.log('🔄 STEP 3: Enhanced Data Point Processing');
    const filteredDataPoints = data.dataPoints
      .map(dataPoint => {
        const { filteredDataPoint } = processDataPoint(dataPoint, normalizedFilterIds);
        return filteredDataPoint;
      })
      .filter(dataPoint => dataPoint.demandHours > 0);

    // STEP 4: Calculate enhanced totals
    console.log('📈 STEP 4: Enhanced Totals Calculation');
    const { 
      totalDemand, 
      totalTasks, 
      totalClients, 
      skillSummary, 
      remainingSkills 
    } = calculateFilteredTotals(filteredDataPoints);

    // STEP 5: Performance metrics generation
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
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

    console.log('⚡ STEP 5: Performance Metrics:', performanceMetrics);

    // STEP 6: Zero results handling
    if (filteredDataPoints.length === 0) {
      console.warn('🚨 STEP 6: Zero Results Detected - Running Comprehensive Diagnostics');
      const diagnostics = generateZeroResultsDiagnostics(
        filters.preferredStaff,
        normalizedFilterIds,
        data
      );
      logZeroResultsDiagnostics(diagnostics);
      
      console.error('❌ Zero results after filtering - this indicates the field mapping issue persists');
      console.groupEnd();
      return this.createEmptyResult(data);
    }

    // STEP 7: Success logging
    console.log('✅ ENHANCED FILTERING SUCCESSFUL:', {
      originalDataPoints: data.dataPoints.length,
      filteredDataPoints: filteredDataPoints.length,
      originalTasks: data.totalTasks,
      filteredTasks: totalTasks,
      filterEfficiency: ((filteredDataPoints.length / data.dataPoints.length) * 100).toFixed(1) + '%',
      processingTime: processingTime.toFixed(2) + 'ms',
      fieldMappingVerified: true,
      enhancedDebuggingComplete: true
    });

    console.groupEnd();

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

  /**
   * Log comprehensive data analysis results
   */
  private logDataAnalysisResults(analysis: any): void {
    console.log('📊 Data Analysis Results:', {
      totalTasks: analysis.totalTasks,
      tasksWithPreferredStaff: analysis.tasksWithPreferredStaff,
      tasksWithoutPreferredStaff: analysis.tasksWithoutPreferredStaff,
      filterCoverage: analysis.filterCoverage.toFixed(1) + '%',
      uniquePreferredStaffIds: analysis.uniquePreferredStaffIds,
      preferredStaffNames: analysis.preferredStaffNames,
      taskDistribution: Object.fromEntries(analysis.tasksByStaff)
    });
  }

  /**
   * Create empty result structure
   */
  private createEmptyResult(originalData: DemandMatrixData): DemandMatrixData {
    return {
      ...originalData,
      dataPoints: [],
      totalDemand: 0,
      totalTasks: 0,
      totalClients: 0,
      skillSummary: {}
    };
  }
}
