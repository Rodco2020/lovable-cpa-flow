
/**
 * Phase 4: Filtering Validation Service
 * 
 * Validates filtering results and ensures data integrity
 */

import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { FilteringResult } from './filteringEngine';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  integrity: DataIntegrityCheck;
}

export interface ValidationError {
  code: string;
  message: string;
  severity: 'critical' | 'major' | 'minor';
  context?: any;
}

export interface ValidationWarning {
  code: string;
  message: string;
  recommendation?: string;
  context?: any;
}

export interface DataIntegrityCheck {
  taskCountConsistency: boolean;
  demandHoursConsistency: boolean;
  clientCountConsistency: boolean;
  skillDataConsistency: boolean;
  monthDataConsistency: boolean;
  preferredStaffConsistency: boolean;
}

export class FilteringValidator {
  /**
   * Phase 4: Comprehensive validation of filtering results
   */
  static validateFilteringResult(
    originalData: DemandMatrixData,
    filters: DemandFilters,
    result: FilteringResult
  ): ValidationResult {
    console.log(`🔍 [PHASE 4 VALIDATOR] Starting comprehensive validation:`, {
      originalDataPoints: originalData.dataPoints.length,
      filteredDataPoints: result.filteredData.dataPoints.length,
      filtersApplied: Object.keys(filters).length,
      timestamp: new Date().toISOString()
    });

    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 1. Validate data structure integrity
    const structureValidation = this.validateDataStructure(result.filteredData);
    errors.push(...structureValidation.errors);
    warnings.push(...structureValidation.warnings);

    // 2. Validate filtering logic consistency
    const logicValidation = this.validateFilteringLogic(originalData, filters, result.filteredData);
    errors.push(...logicValidation.errors);
    warnings.push(...logicValidation.warnings);

    // 3. Validate preferred staff filtering (Phase 4 specific)
    if (filters.preferredStaff) {
      const staffValidation = this.validatePreferredStaffFiltering(
        originalData, 
        filters.preferredStaff, 
        result.filteredData
      );
      errors.push(...staffValidation.errors);
      warnings.push(...staffValidation.warnings);
    }

    // 4. Validate performance metrics
    const performanceValidation = this.validatePerformanceMetrics(result.performanceStats);
    warnings.push(...performanceValidation.warnings);

    // 5. Data integrity checks
    const integrityCheck = this.performDataIntegrityCheck(result.filteredData);

    const validationResult: ValidationResult = {
      isValid: errors.filter(e => e.severity === 'critical').length === 0,
      errors,
      warnings,
      integrity: integrityCheck
    };

    console.log(`✅ [PHASE 4 VALIDATOR] Validation completed:`, {
      isValid: validationResult.isValid,
      criticalErrors: errors.filter(e => e.severity === 'critical').length,
      majorErrors: errors.filter(e => e.severity === 'major').length,
      minorErrors: errors.filter(e => e.severity === 'minor').length,
      warnings: warnings.length,
      integrityScore: this.calculateIntegrityScore(integrityCheck)
    });

    return validationResult;
  }

  private static validateDataStructure(data: DemandMatrixData): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check required fields
    if (!data.dataPoints || !Array.isArray(data.dataPoints)) {
      errors.push({
        code: 'MISSING_DATA_POINTS',
        message: 'Data points array is missing or invalid',
        severity: 'critical'
      });
    }

    if (!data.months || !Array.isArray(data.months)) {
      errors.push({
        code: 'MISSING_MONTHS',
        message: 'Months array is missing or invalid',
        severity: 'critical'
      });
    }

    if (!data.skills || !Array.isArray(data.skills)) {
      errors.push({
        code: 'MISSING_SKILLS',
        message: 'Skills array is missing or invalid',
        severity: 'major'
      });
    }

    // Check data consistency
    data.dataPoints?.forEach((point, index) => {
      if (typeof point.demandHours !== 'number' || point.demandHours < 0) {
        errors.push({
          code: 'INVALID_DEMAND_HOURS',
          message: `Invalid demand hours at data point ${index}`,
          severity: 'major',
          context: { index, demandHours: point.demandHours }
        });
      }

      if (typeof point.taskCount !== 'number' || point.taskCount < 0) {
        errors.push({
          code: 'INVALID_TASK_COUNT',
          message: `Invalid task count at data point ${index}`,
          severity: 'major',
          context: { index, taskCount: point.taskCount }
        });
      }

      if (point.taskBreakdown && point.taskBreakdown.length !== point.taskCount) {
        warnings.push({
          code: 'TASK_BREAKDOWN_MISMATCH',
          message: `Task breakdown length doesn't match task count at data point ${index}`,
          context: { index, taskCount: point.taskCount, breakdownLength: point.taskBreakdown.length }
        });
      }
    });

    return { errors, warnings };
  }

  private static validateFilteringLogic(
    originalData: DemandMatrixData,
    filters: DemandFilters,
    filteredData: DemandMatrixData
  ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate skill filtering
    if (filters.skills && filters.skills.length > 0) {
      const unexpectedSkills = filteredData.skills.filter(skill => !filters.skills!.includes(skill));
      if (unexpectedSkills.length > 0) {
        errors.push({
          code: 'SKILL_FILTER_VIOLATION',
          message: 'Filtered data contains skills not in filter',
          severity: 'major',
          context: { unexpectedSkills }
        });
      }
    }

    // Validate client filtering
    if (filters.clients && filters.clients.length > 0) {
      const clientSet = new Set(filters.clients);
      filteredData.dataPoints.forEach((point, index) => {
        point.taskBreakdown?.forEach((task, taskIndex) => {
          if (!clientSet.has(task.clientId)) {
            errors.push({
              code: 'CLIENT_FILTER_VIOLATION',
              message: 'Filtered data contains clients not in filter',
              severity: 'major',
              context: { dataPointIndex: index, taskIndex, clientId: task.clientId }
            });
          }
        });
      });
    }

    // Check data reduction ratios
    const reductionRatio = (originalData.dataPoints.length - filteredData.dataPoints.length) / originalData.dataPoints.length;
    if (reductionRatio > 0.9) {
      warnings.push({
        code: 'HIGH_DATA_REDUCTION',
        message: 'Filtering removed more than 90% of data',
        recommendation: 'Verify filter criteria are not too restrictive',
        context: { reductionRatio: reductionRatio * 100 }
      });
    }

    return { errors, warnings };
  }

  private static validatePreferredStaffFiltering(
    originalData: DemandMatrixData,
    preferredStaffFilter: NonNullable<DemandFilters['preferredStaff']>,
    filteredData: DemandMatrixData
  ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const { staffIds = [], includeUnassigned = false, showOnlyPreferred = false } = preferredStaffFilter;

    // Determine expected filtering mode
    let expectedMode: 'all' | 'specific' | 'none' = 'all';
    if (showOnlyPreferred && staffIds.length === 0) {
      expectedMode = 'none';
    } else if (staffIds.length > 0) {
      expectedMode = 'specific';
    }

    console.log(`🔍 [VALIDATOR] Validating preferred staff filtering:`, {
      expectedMode,
      staffIds: staffIds.length,
      includeUnassigned,
      showOnlyPreferred
    });

    filteredData.dataPoints.forEach((point, pointIndex) => {
      point.taskBreakdown?.forEach((task, taskIndex) => {
        const hasPreferredStaff = !!task.preferredStaff?.staffId;
        const matchesSelectedStaff = hasPreferredStaff && staffIds.includes(task.preferredStaff!.staffId);

        if (expectedMode === 'specific') {
          // Should only have tasks with selected staff or unassigned (if includeUnassigned)
          if (hasPreferredStaff && !matchesSelectedStaff) {
            errors.push({
              code: 'STAFF_FILTER_VIOLATION_SPECIFIC',
              message: 'Task with non-selected preferred staff found in specific mode',
              severity: 'major',
              context: { pointIndex, taskIndex, staffId: task.preferredStaff?.staffId }
            });
          }
          if (!hasPreferredStaff && !includeUnassigned) {
            errors.push({
              code: 'UNASSIGNED_TASK_IN_SPECIFIC_MODE',
              message: 'Unassigned task found when includeUnassigned is false',
              severity: 'major',
              context: { pointIndex, taskIndex }
            });
          }
        } else if (expectedMode === 'none') {
          // Should only have tasks without preferred staff
          if (hasPreferredStaff) {
            errors.push({
              code: 'ASSIGNED_TASK_IN_NONE_MODE',
              message: 'Task with preferred staff found in none mode',
              severity: 'major',
              context: { pointIndex, taskIndex, staffId: task.preferredStaff?.staffId }
            });
          }
        }
        // Mode 'all' allows any tasks, so no validation needed
      });
    });

    return { errors, warnings };
  }

  private static validatePerformanceMetrics(performanceStats: any): { warnings: ValidationWarning[] } {
    const warnings: ValidationWarning[] = [];

    if (performanceStats.totalProcessingTime > 1000) {
      warnings.push({
        code: 'SLOW_FILTERING_PERFORMANCE',
        message: 'Filtering took longer than 1 second',
        recommendation: 'Consider optimizing filter logic or data structure',
        context: { processingTime: performanceStats.totalProcessingTime }
      });
    }

    if (performanceStats.memoryUsage?.reductionPercentage < 0) {
      warnings.push({
        code: 'MEMORY_USAGE_INCREASE',
        message: 'Memory usage increased after filtering',
        recommendation: 'Review filtering implementation for memory leaks',
        context: { reductionPercentage: performanceStats.memoryUsage.reductionPercentage }
      });
    }

    return { warnings };
  }

  private static performDataIntegrityCheck(data: DemandMatrixData): DataIntegrityCheck {
    const check: DataIntegrityCheck = {
      taskCountConsistency: true,
      demandHoursConsistency: true,
      clientCountConsistency: true,
      skillDataConsistency: true,
      monthDataConsistency: true,
      preferredStaffConsistency: true
    };

    // Check task count consistency
    data.dataPoints.forEach(point => {
      if (point.taskBreakdown && point.taskBreakdown.length !== point.taskCount) {
        check.taskCountConsistency = false;
      }

      // Check demand hours consistency
      if (point.taskBreakdown) {
        const calculatedHours = point.taskBreakdown.reduce((sum, task) => sum + task.monthlyHours, 0);
        if (Math.abs(calculatedHours - point.demandHours) > 0.01) {
          check.demandHoursConsistency = false;
        }
      }

      // Check client count consistency
      if (point.taskBreakdown) {
        const uniqueClients = new Set(point.taskBreakdown.map(task => task.clientId));
        if (uniqueClients.size !== point.clientCount) {
          check.clientCountConsistency = false;
        }
      }
    });

    return check;
  }

  private static calculateIntegrityScore(integrity: DataIntegrityCheck): number {
    const checks = Object.values(integrity);
    const passedChecks = checks.filter(Boolean).length;
    return (passedChecks / checks.length) * 100;
  }
}
