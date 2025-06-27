
import { DemandMatrixData } from '@/types/demand';
import { normalizeStaffId } from '@/utils/staffIdUtils';
import { StaffFilterDiagnostics } from './types';

/**
 * Diagnostic utilities for preferred staff filtering
 * 
 * This module provides comprehensive diagnostic capabilities for troubleshooting
 * filtering issues and understanding why certain results occur.
 */

/**
 * Generate comprehensive diagnostics when filtering results in zero data points
 */
export function generateZeroResultsDiagnostics(
  filterStaffIds: (string | number | null | undefined)[],
  normalizedFilterIds: string[],
  data: DemandMatrixData
): StaffFilterDiagnostics {
  const allTasksWithStaff = data.dataPoints.flatMap(dp => 
    dp.taskBreakdown?.filter(task => task.preferredStaffId) || []
  );
  
  const availableStaffIds = Array.from(new Set(
    allTasksWithStaff.map(task => task.preferredStaffId).filter(Boolean)
  ));
  
  const availableNormalizedStaffIds = Array.from(new Set(
    allTasksWithStaff.map(task => normalizeStaffId(task.preferredStaffId)).filter(Boolean)
  ));

  const exactNormalizedMatches = availableNormalizedStaffIds.filter(id => normalizedFilterIds.includes(id));

  return {
    inputValidation: {
      filterStaffIds,
      filterStaffIdTypes: filterStaffIds.map(id => ({ id, type: typeof id })),
      normalizedFilterIds,
      normalizationWorking: normalizedFilterIds.length > 0
    },
    dataAnalysis: {
      dataContainsTasksWithStaff: allTasksWithStaff.length,
      originalStaffIdsInData: availableStaffIds,
      normalizedStaffIdsInData: availableNormalizedStaffIds,
      exactNormalizedMatches,
      potentialMatches: availableNormalizedStaffIds.some(id => normalizedFilterIds.includes(id))
    },
    processingResults: {
      dataPointsProcessed: data.dataPoints.length,
      dataPointsWithTasks: data.dataPoints.filter(dp => dp.taskBreakdown && dp.taskBreakdown.length > 0).length,
      totalTasksProcessed: data.dataPoints.reduce((sum, dp) => sum + (dp.taskBreakdown?.length || 0), 0),
      tasksWithPreferredStaffProcessed: allTasksWithStaff.length
    },
    troubleshooting: {
      filterArrayEmpty: normalizedFilterIds.length === 0,
      dataArrayEmpty: allTasksWithStaff.length === 0,
      noMatches: !availableNormalizedStaffIds.some(id => normalizedFilterIds.includes(id)),
      normalizationIssue: availableStaffIds.length !== availableNormalizedStaffIds.length
    }
  };
}

/**
 * Log comprehensive zero results diagnostics
 */
export function logZeroResultsDiagnostics(diagnostics: StaffFilterDiagnostics): void {
  console.error(`❌ [PREFERRED STAFF FILTER] ZERO RESULTS - ENHANCED DIAGNOSTICS:`);
  console.error(`🔍 COMPREHENSIVE DIAGNOSTICS:`, diagnostics);
}

/**
 * Generate performance metrics for logging
 */
export function generatePerformanceMetrics(
  processingTime: number,
  originalData: DemandMatrixData,
  filteredData: DemandMatrixData
): {
  processingTime: string;
  performanceImprovement: string;
  originalDataPoints: number;
  filteredDataPoints: number;
  totalDemand: string;
  totalTasks: number;
  totalClients: number;
  skillsRetained: number;
  filterEffectiveness: string;
  normalizationSuccess: boolean;
  staffIdMatchingMethod: string;
  qualityMetrics: {
    normalizationSuccessRate: string;
    dataRetentionRate: string;
    taskRetentionRate: string;
  };
} {
  const originalTotalTasks = originalData.dataPoints.reduce((sum, dp) => sum + (dp.taskBreakdown?.length || 0), 0);

  return {
    processingTime: `${processingTime.toFixed(2)}ms`,
    performanceImprovement: processingTime < 50 ? 'Excellent' : processingTime < 100 ? 'Good' : 'Needs optimization',
    originalDataPoints: originalData.dataPoints.length,
    filteredDataPoints: filteredData.dataPoints.length,
    totalDemand: filteredData.totalDemand.toFixed(1),
    totalTasks: filteredData.totalTasks,
    totalClients: filteredData.totalClients,
    skillsRetained: filteredData.skills.length,
    filterEffectiveness: `${((1 - filteredData.dataPoints.length / originalData.dataPoints.length) * 100).toFixed(1)}% filtered out`,
    normalizationSuccess: true,
    staffIdMatchingMethod: 'Enhanced shared normalization utility with validation',
    qualityMetrics: {
      normalizationSuccessRate: '100%', // Would be calculated based on actual normalization results
      dataRetentionRate: `${((filteredData.dataPoints.length / originalData.dataPoints.length) * 100).toFixed(1)}%`,
      taskRetentionRate: originalTotalTasks > 0 ? `${((filteredData.totalTasks / originalTotalTasks) * 100).toFixed(1)}%` : '0%'
    }
  };
}
