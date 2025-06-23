
import { DemandMatrixData } from '@/types/demand';
import { ValidationResult, ProcessingError } from './types';

/**
 * Matrix Data Validator - Phase 4 Enhanced
 * Handles validation with staff-specific checks and unassigned task validation
 */
export class MatrixValidator {
  /**
   * Phase 4: Enhanced matrix data validation with staff checks
   */
  static validateMatrixData(matrixData: DemandMatrixData): ValidationResult {
    const issues: string[] = [];
    const warnings: string[] = [];
    const staffRelatedIssues: string[] = [];

    try {
      // Validate core structure
      this.validateCoreStructure(matrixData, issues);
      
      // Validate revenue structure
      this.validateRevenueStructure(matrixData, issues, warnings);
      
      // Validate data point revenue fields
      this.validateDataPointRevenue(matrixData, warnings);
      
      // Phase 4: Enhanced staff validation
      this.validateStaffInformation(matrixData, warnings, staffRelatedIssues);
      
      // Phase 4: Validate unassigned tasks handling
      this.validateUnassignedTasksHandling(matrixData, warnings, staffRelatedIssues);
      
      // Phase 4: Validate data consistency
      this.validateDataConsistency(matrixData, issues, warnings);

      return {
        isValid: issues.length === 0,
        issues,
        warnings,
        staffRelatedIssues
      };
    } catch (error) {
      issues.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        isValid: false,
        issues,
        warnings,
        staffRelatedIssues
      };
    }
  }

  /**
   * Validate core matrix structure
   */
  private static validateCoreStructure(matrixData: DemandMatrixData, issues: string[]): void {
    if (!matrixData.months || matrixData.months.length === 0) {
      issues.push('Months array is missing or empty');
    }

    if (!matrixData.skills || matrixData.skills.length === 0) {
      issues.push('Skills array is missing or empty');
    }

    if (!matrixData.dataPoints || !Array.isArray(matrixData.dataPoints)) {
      issues.push('Data points array is missing or invalid');
    }
  }

  /**
   * Validate revenue structure
   */
  private static validateRevenueStructure(
    matrixData: DemandMatrixData, 
    issues: string[], 
    warnings: string[]
  ): void {
    if (!matrixData.revenueTotals) {
      warnings.push('Revenue totals are missing');
    } else {
      if (typeof matrixData.revenueTotals.totalSuggestedRevenue !== 'number') {
        issues.push('Total suggested revenue is not a number');
      }
      if (typeof matrixData.revenueTotals.totalExpectedRevenue !== 'number') {
        issues.push('Total expected revenue is not a number');
      }
    }
  }

  /**
   * Validate data point revenue fields
   */
  private static validateDataPointRevenue(matrixData: DemandMatrixData, warnings: string[]): void {
    const dataPointsWithRevenue = matrixData.dataPoints.filter(dp => 
      dp.suggestedRevenue !== undefined || dp.expectedLessSuggested !== undefined
    );

    if (dataPointsWithRevenue.length === 0) {
      warnings.push('No data points contain revenue information');
    }
  }

  /**
   * Phase 4: Enhanced staff information validation
   */
  private static validateStaffInformation(
    matrixData: DemandMatrixData, 
    warnings: string[], 
    staffRelatedIssues: string[]
  ): void {
    if (!matrixData.availableStaff || matrixData.availableStaff.length === 0) {
      warnings.push('No staff information available');
      staffRelatedIssues.push('Missing staff data could affect assignment tracking');
    }

    if (!matrixData.staffSummary || Object.keys(matrixData.staffSummary).length === 0) {
      warnings.push('Staff summary is empty');
      staffRelatedIssues.push('Staff summary unavailable - assignment analysis limited');
    }

    // Validate staff assignment consistency
    const dataPointsWithStaffInfo = matrixData.dataPoints.filter(dp => 
      dp.taskBreakdown?.some(task => task.preferredStaffId || task.isUnassigned)
    );

    if (dataPointsWithStaffInfo.length === 0) {
      staffRelatedIssues.push('No data points contain staff assignment information');
    }

    // Check for orphaned staff assignments
    const staffIdsInDataPoints = new Set<string>();
    matrixData.dataPoints.forEach(dp => {
      dp.taskBreakdown?.forEach(task => {
        if (task.preferredStaffId && !task.isUnassigned) {
          staffIdsInDataPoints.add(task.preferredStaffId);
        }
      });
    });

    const staffIdsInAvailable = new Set(matrixData.availableStaff?.map(s => s.id) || []);
    const orphanedAssignments = Array.from(staffIdsInDataPoints).filter(id => !staffIdsInAvailable.has(id));

    if (orphanedAssignments.length > 0) {
      staffRelatedIssues.push(`Found ${orphanedAssignments.length} staff assignments without corresponding staff records`);
    }
  }

  /**
   * Phase 4: Validate unassigned tasks handling
   */
  private static validateUnassignedTasksHandling(
    matrixData: DemandMatrixData,
    warnings: string[],
    staffRelatedIssues: string[]
  ): void {
    let totalUnassignedTasks = 0;
    let totalUnassignedHours = 0;

    matrixData.dataPoints.forEach(dp => {
      if (dp.unassignedHours && dp.unassignedHours > 0) {
        totalUnassignedHours += dp.unassignedHours;
      }
      
      if (dp.taskBreakdown) {
        const unassignedInPoint = dp.taskBreakdown.filter(task => task.isUnassigned);
        totalUnassignedTasks += unassignedInPoint.length;
      }
    });

    if (totalUnassignedTasks > 0) {
      staffRelatedIssues.push(`${totalUnassignedTasks} unassigned tasks detected (${totalUnassignedHours.toFixed(1)} hours)`);
    }

    // Check if unassigned tasks are properly tracked in staff summary
    const unassignedInStaffSummary = matrixData.staffSummary?.['UNASSIGNED'];
    if (totalUnassignedTasks > 0 && !unassignedInStaffSummary) {
      staffRelatedIssues.push('Unassigned tasks detected but not reflected in staff summary');
    }
  }

  /**
   * Phase 4: Validate data consistency across different views
   */
  private static validateDataConsistency(
    matrixData: DemandMatrixData,
    issues: string[],
    warnings: string[]
  ): void {
    try {
      // Validate total demand consistency
      const calculatedTotalDemand = matrixData.dataPoints.reduce((sum, dp) => sum + dp.demandHours, 0);
      const declaredTotalDemand = matrixData.totalDemand;

      if (Math.abs(calculatedTotalDemand - declaredTotalDemand) > 0.01) {
        issues.push(`Demand total mismatch: calculated ${calculatedTotalDemand}, declared ${declaredTotalDemand}`);
      }

      // Validate client count consistency
      const uniqueClientsInDataPoints = new Set<string>();
      matrixData.dataPoints.forEach(dp => {
        dp.taskBreakdown?.forEach(task => {
          if (task.clientId) {
            uniqueClientsInDataPoints.add(task.clientId);
          }
        });
      });

      const declaredTotalClients = matrixData.totalClients;
      if (uniqueClientsInDataPoints.size !== declaredTotalClients) {
        warnings.push(`Client count mismatch: found ${uniqueClientsInDataPoints.size}, declared ${declaredTotalClients}`);
      }

    } catch (error) {
      warnings.push(`Data consistency validation failed: ${error}`);
    }
  }

  /**
   * Phase 4: Validate processing errors and provide recovery suggestions
   */
  static validateProcessingErrors(errors: ProcessingError[]): {
    criticalErrors: ProcessingError[];
    recoverableErrors: ProcessingError[];
    suggestions: string[];
  } {
    const criticalErrors = errors.filter(e => !e.recoverable);
    const recoverableErrors = errors.filter(e => e.recoverable);
    const suggestions: string[] = [];

    if (criticalErrors.some(e => e.type === 'DATA_CORRUPTION')) {
      suggestions.push('Data corruption detected - consider refreshing source data');
    }

    if (recoverableErrors.some(e => e.type === 'STAFF_MISSING')) {
      suggestions.push('Some staff records are missing - assignments may show as unassigned');
    }

    if (errors.length > 10) {
      suggestions.push('High error count detected - consider investigating data quality');
    }

    return {
      criticalErrors,
      recoverableErrors,
      suggestions
    };
  }
}
