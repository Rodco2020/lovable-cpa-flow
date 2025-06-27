
import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { normalizeStaffId, findStaffIdMatches } from '@/utils/staffIdUtils';
import { StaffFilterAnalysis } from './types';

/**
 * Validation utilities for preferred staff filtering
 * 
 * This module handles validation of filter inputs and data analysis
 * to ensure robust filtering operations with comprehensive error checking.
 */

/**
 * Validate preferred staff filters and normalize them
 */
export function validateAndNormalizeFilters(
  preferredStaff: (string | number | null | undefined)[]
): {
  normalizedFilterIds: string[];
  isValid: boolean;
  validationLog: Array<{
    originalId: any;
    originalType: string;
    normalizedId: string | undefined;
    normalizationSuccess: boolean;
  }>;
} {
  const validationLog: Array<{
    originalId: any;
    originalType: string;
    normalizedId: string | undefined;
    normalizationSuccess: boolean;
  }> = [];

  const normalizedFilterIds = preferredStaff
    .map(id => {
      const normalized = normalizeStaffId(id);
      const logEntry = {
        originalId: id,
        originalType: typeof id,
        normalizedId: normalized,
        normalizationSuccess: !!normalized
      };
      validationLog.push(logEntry);
      
      console.log(`🔧 [PREFERRED STAFF FILTER] Normalizing filter ID:`, logEntry);
      return normalized;
    })
    .filter(id => id !== undefined) as string[];

  const isValid = normalizedFilterIds.length > 0;

  console.log(`🔍 [PREFERRED STAFF FILTER] Filter validation:`, {
    originalFilterIds: preferredStaff,
    normalizedFilterIds,
    normalizationSuccessRate: `${((normalizedFilterIds.length / preferredStaff.length) * 100).toFixed(1)}%`,
    filterValidationPassed: isValid
  });

  return {
    normalizedFilterIds,
    isValid,
    validationLog
  };
}

/**
 * Analyze filter data for optimization and diagnostics
 */
export function analyzeFilterData(
  data: DemandMatrixData,
  normalizedFilterIds: string[]
): StaffFilterAnalysis {
  const allTasksWithStaff = data.dataPoints.flatMap(dp => 
    dp.taskBreakdown?.filter(task => task.preferredStaffId) || []
  );
  
  const availableStaffIds = Array.from(new Set(
    allTasksWithStaff.map(task => task.preferredStaffId).filter(Boolean)
  ));
  
  const availableNormalizedStaffIds = Array.from(new Set(
    allTasksWithStaff.map(task => normalizeStaffId(task.preferredStaffId)).filter(Boolean)
  ));

  const matches = findStaffIdMatches(normalizedFilterIds, availableNormalizedStaffIds);

  console.log(`🔍 [PREFERRED STAFF FILTER] Pre-filter data analysis:`, {
    totalDataPoints: data.dataPoints.length,
    totalTasks: data.dataPoints.reduce((sum, dp) => sum + (dp.taskBreakdown?.length || 0), 0),
    tasksWithPreferredStaff: allTasksWithStaff.length,
    availableStaffIds,
    availableNormalizedStaffIds,
    potentialMatches: matches.matches,
    expectedFilteringSuccess: matches.totalMatches > 0
  });

  return {
    hasValidFilters: normalizedFilterIds.length > 0,
    validFilterCount: normalizedFilterIds.length,
    potentialMatches: matches.totalMatches,
    normalizationSuccessRate: (normalizedFilterIds.length / normalizedFilterIds.length) * 100,
    expectedFilteringSuccess: matches.totalMatches > 0
  };
}

/**
 * Early validation check to prevent unnecessary processing
 */
export function shouldProceedWithFiltering(filters: DemandFilters): boolean {
  return Array.isArray(filters.preferredStaff) && filters.preferredStaff.length > 0;
}
