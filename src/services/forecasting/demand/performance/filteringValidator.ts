
/**
 * Phase 4: Advanced Filtering Validator
 * 
 * Comprehensive validation service for filtering operations with enhanced
 * error detection, data integrity checks, and performance monitoring.
 */

import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { extractStaffId } from '../utils/staffIdExtractor';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  performanceMetrics: {
    validationTime: number;
    checksPerformed: number;
  };
}

export interface ValidationError {
  code: string;
  message: string;
  field?: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  code: string;
  message: string;
  field?: string;
  recommendation?: string;
}

/**
 * Phase 4: Advanced filtering validation with comprehensive error detection
 */
export class FilteringValidator {
  /**
   * Validate filtering input data and configuration
   */
  static validateFilteringInput(
    data: DemandMatrixData,
    filters: DemandFilters
  ): ValidationResult {
    const startTime = Date.now();
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let checksPerformed = 0;

    console.log(`🔍 [PHASE 4 VALIDATOR] Starting comprehensive validation:`, {
      dataPointsCount: data.dataPoints.length,
      filtersCount: Object.keys(filters).length
    });

    // Validate data structure
    const dataValidation = this.validateDataStructure(data);
    errors.push(...dataValidation.errors);
    warnings.push(...dataValidation.warnings);
    checksPerformed += dataValidation.checksPerformed;

    // Validate filters
    const filtersValidation = this.validateFilters(filters);
    errors.push(...filtersValidation.errors);
    warnings.push(...filtersValidation.warnings);
    checksPerformed += filtersValidation.checksPerformed;

    // Validate compatibility
    const compatibilityValidation = this.validateFilterCompatibility(data, filters);
    errors.push(...compatibilityValidation.errors);
    warnings.push(...compatibilityValidation.warnings);
    checksPerformed += compatibilityValidation.checksPerformed;

    const validationTime = Date.now() - startTime;
    const isValid = errors.filter(e => e.severity === 'error').length === 0;

    console.log(`${isValid ? '✅' : '❌'} [PHASE 4 VALIDATOR] Validation completed:`, {
      isValid,
      errorsCount: errors.filter(e => e.severity === 'error').length,
      warningsCount: warnings.length,
      validationTime,
      checksPerformed
    });

    return {
      isValid,
      errors,
      warnings,
      performanceMetrics: {
        validationTime,
        checksPerformed
      }
    };
  }

  /**
   * Validate filtering result against expected criteria
   */
  static validateFilteringResult(
    originalData: DemandMatrixData,
    filters: DemandFilters,
    filteredData: DemandMatrixData
  ): ValidationResult {
    const startTime = Date.now();
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let checksPerformed = 0;

    // Check data reduction is reasonable
    checksPerformed++;
    const reductionRatio = originalData.dataPoints.length > 0 
      ? (originalData.dataPoints.length - filteredData.dataPoints.length) / originalData.dataPoints.length 
      : 0;

    if (reductionRatio > 0.9) {
      warnings.push({
        code: 'EXCESSIVE_DATA_REDUCTION',
        message: `Filtering reduced data by ${(reductionRatio * 100).toFixed(1)}%. This might be too aggressive.`,
        recommendation: 'Review filter criteria to ensure they are not overly restrictive'
      });
    }

    // Validate preferred staff filtering consistency
    checksPerformed++;
    if (filters.preferredStaffIds || filters.preferredStaff) {
      const staffFilterValidation = this.validatePreferredStaffFiltering(filteredData, filters);
      errors.push(...staffFilterValidation.errors);
      warnings.push(...staffFilterValidation.warnings);
      checksPerformed += staffFilterValidation.checksPerformed;
    }

    // Check totals consistency
    checksPerformed++;
    const calculatedTotalDemand = filteredData.dataPoints.reduce((sum, point) => sum + point.demandHours, 0);
    if (Math.abs(calculatedTotalDemand - filteredData.totalDemand) > 0.01) {
      errors.push({
        code: 'TOTALS_INCONSISTENCY',
        message: `Total demand mismatch: calculated ${calculatedTotalDemand}, stored ${filteredData.totalDemand}`,
        severity: 'error'
      });
    }

    const validationTime = Date.now() - startTime;
    const isValid = errors.filter(e => e.severity === 'error').length === 0;

    return {
      isValid,
      errors,
      warnings,
      performanceMetrics: {
        validationTime,
        checksPerformed
      }
    };
  }

  /**
   * Validate data structure integrity
   */
  private static validateDataStructure(data: DemandMatrixData): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
    checksPerformed: number;
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let checksPerformed = 0;

    // Check required fields
    checksPerformed++;
    if (!data.dataPoints) {
      errors.push({
        code: 'MISSING_DATA_POINTS',
        message: 'Data points array is missing',
        field: 'dataPoints',
        severity: 'error'
      });
    }

    // Check data points structure
    if (data.dataPoints) {
      data.dataPoints.forEach((point, index) => {
        checksPerformed++;
        if (!point.skillType) {
          errors.push({
            code: 'MISSING_SKILL_TYPE',
            message: `Data point ${index} is missing skillType`,
            field: `dataPoints[${index}].skillType`,
            severity: 'error'
          });
        }

        // Validate task breakdown
        if (point.taskBreakdown) {
          point.taskBreakdown.forEach((task, taskIndex) => {
            checksPerformed++;
            if (task.preferredStaff) {
              const staffId = extractStaffId(task.preferredStaff);
              if (!staffId && typeof task.preferredStaff === 'object') {
                warnings.push({
                  code: 'INVALID_PREFERRED_STAFF',
                  message: `Task ${taskIndex} has invalid preferred staff structure`,
                  field: `dataPoints[${index}].taskBreakdown[${taskIndex}].preferredStaff`,
                  recommendation: 'Ensure preferred staff has valid staffId'
                });
              }
            }
          });
        }
      });
    }

    return { errors, warnings, checksPerformed };
  }

  /**
   * Validate preferred staff filtering logic
   */
  private static validatePreferredStaffFiltering(
    data: DemandMatrixData,
    filters: DemandFilters
  ): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
    checksPerformed: number;
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let checksPerformed = 0;

    const preferredStaffConfig = filters.preferredStaff || {
      staffIds: filters.preferredStaffIds || [],
      includeUnassigned: false,
      showOnlyPreferred: false
    };

    // Check if filtering actually applied
    checksPerformed++;
    if (preferredStaffConfig.staffIds.length > 0 || preferredStaffConfig.showOnlyPreferred) {
      let hasMatchingTasks = false;
      
      data.dataPoints.forEach(point => {
        point.taskBreakdown?.forEach(task => {
          checksPerformed++;
          const staffId = extractStaffId(task.preferredStaff);
          if (staffId && preferredStaffConfig.staffIds.includes(staffId)) {
            hasMatchingTasks = true;
          }
        });
      });

      if (!hasMatchingTasks && preferredStaffConfig.staffIds.length > 0) {
        warnings.push({
          code: 'NO_MATCHING_STAFF_TASKS',
          message: 'No tasks found matching the selected preferred staff',
          recommendation: 'Verify that the selected staff have assigned tasks in the current data set'
        });
      }
    }

    return { errors, warnings, checksPerformed };
  }

  /**
   * Validate filters configuration
   */
  private static validateFilters(filters: DemandFilters): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
    checksPerformed: number;
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let checksPerformed = 0;

    // Validate date ranges
    checksPerformed++;
    if (filters.timeHorizon) {
      if (filters.timeHorizon.start >= filters.timeHorizon.end) {
        errors.push({
          code: 'INVALID_DATE_RANGE',
          message: 'Start date must be before end date',
          field: 'timeHorizon',
          severity: 'error'
        });
      }
    }

    // Validate arrays
    checksPerformed++;
    if (filters.skillTypes && !Array.isArray(filters.skillTypes)) {
      errors.push({
        code: 'INVALID_SKILL_TYPES',
        message: 'skillTypes must be an array',
        field: 'skillTypes',
        severity: 'error'
      });
    }

    return { errors, warnings, checksPerformed };
  }

  /**
   * Validate filter compatibility with data
   */
  private static validateFilterCompatibility(
    data: DemandMatrixData,
    filters: DemandFilters
  ): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
    checksPerformed: number;
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let checksPerformed = 0;

    // Check if skills exist in data
    checksPerformed++;
    if (filters.skillTypes) {
      const availableSkills = new Set(data.skills);
      const missingSkills = filters.skillTypes.filter(skill => !availableSkills.has(skill));
      
      if (missingSkills.length > 0) {
        warnings.push({
          code: 'SKILLS_NOT_FOUND',
          message: `Skills not found in data: ${missingSkills.join(', ')}`,
          field: 'skillTypes',
          recommendation: 'Remove non-existent skills from filter or update data'
        });
      }
    }

    return { errors, warnings, checksPerformed };
  }
}
