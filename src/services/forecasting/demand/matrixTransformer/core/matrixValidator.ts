
import { DemandMatrixData } from '@/types/demand';
import { ValidationResult } from './types';

/**
 * Matrix Data Validator
 * Handles validation of transformed matrix data
 */
export class MatrixValidator {
  /**
   * Validate matrix data structure and content
   */
  static validateMatrixData(matrixData: DemandMatrixData): ValidationResult {
    const issues: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate core structure
      this.validateCoreStructure(matrixData, issues);
      
      // Validate revenue structure
      this.validateRevenueStructure(matrixData, issues, warnings);
      
      // Validate data point revenue fields
      this.validateDataPointRevenue(matrixData, warnings);
      
      // Validate staff information
      this.validateStaffInformation(matrixData, warnings);

      return {
        isValid: issues.length === 0,
        issues,
        warnings
      };
    } catch (error) {
      issues.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        isValid: false,
        issues,
        warnings
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
   * Validate staff information
   */
  private static validateStaffInformation(matrixData: DemandMatrixData, warnings: string[]): void {
    if (!matrixData.availableStaff || matrixData.availableStaff.length === 0) {
      warnings.push('No staff information available');
    }

    if (!matrixData.staffSummary || Object.keys(matrixData.staffSummary).length === 0) {
      warnings.push('Staff summary is empty');
    }
  }
}
