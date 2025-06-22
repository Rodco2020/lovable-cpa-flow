
/**
 * Validation Service
 * 
 * Handles validation of filtering operations and data integrity
 */

import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { ValidationResult } from './types';

export class ValidationService {
  /**
   * Validate filtering result for data integrity
   */
  static validateFilteringResult(
    originalData: DemandMatrixData,
    filters: DemandFilters,
    filteredData: DemandMatrixData
  ): ValidationResult {
    const errors: Array<{ message: string; severity: 'error' | 'warning' }> = [];
    const warnings: string[] = [];

    // Validate data structure integrity
    if (!filteredData.dataPoints || !Array.isArray(filteredData.dataPoints)) {
      errors.push({
        message: 'Filtered data points are missing or invalid',
        severity: 'error'
      });
    }

    if (!filteredData.months || !Array.isArray(filteredData.months)) {
      errors.push({
        message: 'Filtered months are missing or invalid',
        severity: 'error'
      });
    }

    if (!filteredData.skills || !Array.isArray(filteredData.skills)) {
      errors.push({
        message: 'Filtered skills are missing or invalid',
        severity: 'error'
      });
    }

    // Validate totals consistency
    const calculatedTotalDemand = filteredData.dataPoints.reduce((sum, point) => sum + point.demandHours, 0);
    if (Math.abs(calculatedTotalDemand - filteredData.totalDemand) > 0.01) {
      warnings.push(`Total demand mismatch: calculated ${calculatedTotalDemand}, stored ${filteredData.totalDemand}`);
    }

    const calculatedTotalTasks = filteredData.dataPoints.reduce((sum, point) => sum + point.taskCount, 0);
    if (calculatedTotalTasks !== filteredData.totalTasks) {
      warnings.push(`Total tasks mismatch: calculated ${calculatedTotalTasks}, stored ${filteredData.totalTasks}`);
    }

    // Validate filtering logic consistency
    if (filteredData.dataPoints.length > originalData.dataPoints.length) {
      errors.push({
        message: 'Filtered data has more points than original data',
        severity: 'error'
      });
    }

    // Check for empty results with filters applied
    if (filteredData.dataPoints.length === 0 && originalData.dataPoints.length > 0) {
      const hasActiveFilters = Object.values(filters).some(filter => {
        if (Array.isArray(filter)) return filter.length > 0;
        if (typeof filter === 'object' && filter !== null) return true;
        return false;
      });

      if (hasActiveFilters) {
        warnings.push('Filtering resulted in no data points - filters may be too restrictive');
      }
    }

    const isValid = errors.length === 0;

    return {
      isValid,
      errors,
      warnings
    };
  }

  /**
   * Validate filter configuration
   */
  static validateFilterConfiguration(filters: DemandFilters): ValidationResult {
    const errors: Array<{ message: string; severity: 'error' | 'warning' }> = [];
    const warnings: string[] = [];

    // Validate date range
    if (filters.dateRange || filters.timeHorizon) {
      const dateRange = filters.dateRange || filters.timeHorizon;
      if (dateRange) {
        if (!(dateRange.start instanceof Date) || !(dateRange.end instanceof Date)) {
          errors.push({
            message: 'Date range must contain valid Date objects',
            severity: 'error'
          });
        } else if (dateRange.start >= dateRange.end) {
          errors.push({
            message: 'Date range start must be before end date',
            severity: 'error'
          });
        }
      }
    }

    // Validate arrays
    if (filters.skillTypes && !Array.isArray(filters.skillTypes)) {
      errors.push({
        message: 'skillTypes must be an array',
        severity: 'error'
      });
    }

    if (filters.clientIds && !Array.isArray(filters.clientIds)) {
      errors.push({
        message: 'clientIds must be an array',
        severity: 'error'
      });
    }

    if (filters.preferredStaffIds && !Array.isArray(filters.preferredStaffIds)) {
      errors.push({
        message: 'preferredStaffIds must be an array',
        severity: 'error'
      });
    }

    const isValid = errors.length === 0;

    return {
      isValid,
      errors,
      warnings
    };
  }
}
