
/**
 * Diagnostic utilities for Preferred Staff Filter Strategy
 * 
 * This module provides comprehensive diagnostic and troubleshooting capabilities
 * for the preferred staff filtering system.
 */

import { DemandMatrixData } from '@/types/demand';
import { StaffFilterDiagnostics, FilteringPerformanceMetrics } from './types';
import { analyzeFilterData } from './validationUtils';

/**
 * Generate comprehensive diagnostics for zero results scenario
 */
export function generateZeroResultsDiagnostics(
  originalFilterIds: (string | number)[],
  normalizedFilterIds: string[],
  data: DemandMatrixData
): StaffFilterDiagnostics {
  const filterAnalysis = analyzeFilterData(data, normalizedFilterIds);
  
  const potentialIssues: string[] = [];
  const recommendations: string[] = [];

  // Analyze potential issues
  if (filterAnalysis.totalTasks === 0) {
    potentialIssues.push('No tasks found in the dataset');
    recommendations.push('Check if data is loading correctly from the database');
  }

  if (filterAnalysis.tasksWithPreferredStaff === 0) {
    potentialIssues.push('No tasks have preferred staff assigned');
    recommendations.push('Verify that tasks are being created with preferred staff assignments');
  }

  if (normalizedFilterIds.length === 0) {
    potentialIssues.push('All filter IDs failed normalization');
    recommendations.push('Check the format of the staff IDs being used for filtering');
  }

  if (filterAnalysis.uniquePreferredStaffIds.length > 0 && normalizedFilterIds.length > 0) {
    const hasMatchingIds = normalizedFilterIds.some(filterId => 
      filterAnalysis.uniquePreferredStaffIds.includes(filterId)
    );
    
    if (!hasMatchingIds) {
      potentialIssues.push('No overlap between filter IDs and task preferred staff IDs');
      recommendations.push('Verify that the selected staff IDs match the ones assigned to tasks');
      recommendations.push('Check if staff ID normalization is working consistently');
    }
  }

  const diagnostics: StaffFilterDiagnostics = {
    filterInputs: {
      originalStaffIds: originalFilterIds,
      normalizedStaffIds: normalizedFilterIds,
      validationSuccess: normalizedFilterIds.length > 0,
      invalidIds: originalFilterIds.filter((_, index) => 
        !normalizedFilterIds[index]
      )
    },
    dataAnalysis: filterAnalysis,
    filterResults: {
      originalDataPoints: data.dataPoints.length,
      filteredDataPoints: 0,
      totalTasksProcessed: filterAnalysis.totalTasks,
      tasksRetained: 0,
      tasksFiltered: filterAnalysis.totalTasks,
      filterEfficiency: 0
    },
    potentialIssues,
    recommendations
  };

  return diagnostics;
}

/**
 * Log zero results diagnostics with detailed information
 */
export function logZeroResultsDiagnostics(diagnostics: StaffFilterDiagnostics): void {
  console.group('🚨 [PREFERRED STAFF FILTER] Zero Results Diagnostics');
  
  console.log('📋 Filter Input Analysis:', diagnostics.filterInputs);
  console.log('📊 Data Analysis:', diagnostics.dataAnalysis);
  console.log('🔄 Filter Results:', diagnostics.filterResults);
  
  if (diagnostics.potentialIssues.length > 0) {
    console.warn('⚠️ Potential Issues:');
    diagnostics.potentialIssues.forEach((issue, index) => {
      console.warn(`  ${index + 1}. ${issue}`);
    });
  }
  
  if (diagnostics.recommendations.length > 0) {
    console.info('💡 Recommendations:');
    diagnostics.recommendations.forEach((rec, index) => {
      console.info(`  ${index + 1}. ${rec}`);
    });
  }
  
  console.groupEnd();
}

/**
 * Generate performance metrics for the filtering operation
 */
export function generatePerformanceMetrics(
  processingTime: number,
  originalData: DemandMatrixData,
  filteredData: DemandMatrixData
): FilteringPerformanceMetrics {
  const originalSize = originalData.dataPoints.reduce((sum, dp) => 
    sum + (dp.taskBreakdown?.length || 0), 0
  );
  
  const filteredSize = filteredData.dataPoints.reduce((sum, dp) => 
    sum + (dp.taskBreakdown?.length || 0), 0
  );

  const metrics: FilteringPerformanceMetrics = {
    processingTime,
    dataPointsProcessed: originalData.dataPoints.length,
    tasksProcessed: originalSize,
    filterHitRate: originalSize > 0 ? (filteredSize / originalSize) * 100 : 0,
    originalDataSize: originalSize,
    filteredDataSize: filteredSize,
    compressionRatio: originalSize > 0 ? (filteredSize / originalSize) : 0
  };

  return metrics;
}
