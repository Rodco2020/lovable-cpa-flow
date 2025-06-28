
/**
 * Validation utilities for Preferred Staff Filter Strategy
 * 
 * This module handles input validation, normalization, and data analysis
 * for the preferred staff filtering system.
 */

import { DemandFilters, DemandMatrixData } from '@/types/demand';
import { normalizeStaffId } from '@/utils/staffIdUtils';
import { StaffFilterAnalysis } from './types';

export interface FilterValidationResult {
  normalizedFilterIds: string[];
  isValid: boolean;
  invalidIds: (string | number)[];
  validationErrors: string[];
}

/**
 * Validate and normalize preferred staff filter IDs
 */
export function validateAndNormalizeFilters(
  preferredStaffIds: (string | number)[]
): FilterValidationResult {
  console.log('🔍 [VALIDATION] Starting filter validation:', {
    inputIds: preferredStaffIds,
    inputLength: preferredStaffIds?.length || 0,
    inputType: typeof preferredStaffIds
  });

  if (!Array.isArray(preferredStaffIds)) {
    console.error('❌ [VALIDATION] Preferred staff IDs is not an array:', preferredStaffIds);
    return {
      normalizedFilterIds: [],
      isValid: false,
      invalidIds: [],
      validationErrors: ['Input is not an array']
    };
  }

  const normalizedFilterIds: string[] = [];
  const invalidIds: (string | number)[] = [];
  const validationErrors: string[] = [];

  for (const id of preferredStaffIds) {
    if (id === null || id === undefined) {
      invalidIds.push(id);
      validationErrors.push(`Null/undefined ID: ${id}`);
      continue;
    }

    const normalizedId = normalizeStaffId(id);
    
    if (normalizedId) {
      normalizedFilterIds.push(normalizedId);
      console.log(`✅ [VALIDATION] Normalized ${id} -> ${normalizedId}`);
    } else {
      invalidIds.push(id);
      validationErrors.push(`Failed to normalize ID: ${id}`);
      console.warn(`⚠️ [VALIDATION] Failed to normalize ID: ${id}`);
    }
  }

  const isValid = normalizedFilterIds.length > 0;

  console.log('📊 [VALIDATION] Validation complete:', {
    originalCount: preferredStaffIds.length,
    normalizedCount: normalizedFilterIds.length,
    invalidCount: invalidIds.length,
    isValid,
    normalizedIds: normalizedFilterIds
  });

  return {
    normalizedFilterIds,
    isValid,
    invalidIds,
    validationErrors
  };
}

/**
 * Analyze filter data to understand coverage and distribution
 */
export function analyzeFilterData(
  data: DemandMatrixData,
  normalizedFilterIds: string[]
): StaffFilterAnalysis {
  const tasksByStaff = new Map<string, number>();
  const uniquePreferredStaffIds = new Set<string>();
  const preferredStaffNames = new Set<string>();
  
  let totalTasks = 0;
  let tasksWithPreferredStaff = 0;

  // Analyze all tasks in all data points
  data.dataPoints.forEach(dataPoint => {
    if (dataPoint.taskBreakdown) {
      dataPoint.taskBreakdown.forEach(task => {
        totalTasks++;
        
        if (task.preferredStaffId) {
          tasksWithPreferredStaff++;
          uniquePreferredStaffIds.add(task.preferredStaffId);
          
          if (task.preferredStaffName) {
            preferredStaffNames.add(task.preferredStaffName);
          }
          
          const count = tasksByStaff.get(task.preferredStaffId) || 0;
          tasksByStaff.set(task.preferredStaffId, count + 1);
        }
      });
    }
  });

  const filterCoverage = totalTasks > 0 ? (tasksWithPreferredStaff / totalTasks) * 100 : 0;

  const analysis: StaffFilterAnalysis = {
    totalTasks,
    tasksWithPreferredStaff,
    tasksWithoutPreferredStaff: totalTasks - tasksWithPreferredStaff,
    uniquePreferredStaffIds: Array.from(uniquePreferredStaffIds),
    preferredStaffNames: Array.from(preferredStaffNames),
    filterCoverage,
    tasksByStaff
  };

  console.log('📈 [ANALYSIS] Filter data analysis:', analysis);
  
  return analysis;
}

/**
 * Determine if filtering should proceed based on filters
 */
export function shouldProceedWithFiltering(filters: DemandFilters): boolean {
  const hasPreferredStaffFilter = filters.preferredStaff && 
    Array.isArray(filters.preferredStaff) && 
    filters.preferredStaff.length > 0;
  
  console.log('🤔 [VALIDATION] Should proceed with filtering?', {
    hasPreferredStaffFilter,
    filterLength: filters.preferredStaff?.length || 0,
    filterIds: filters.preferredStaff
  });
  
  return hasPreferredStaffFilter;
}
