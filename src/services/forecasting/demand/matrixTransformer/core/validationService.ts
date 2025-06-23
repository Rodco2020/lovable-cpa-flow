
/**
 * Validation Service for Matrix Transformation
 * Extracted from matrixTransformerCore.ts for better maintainability
 */

import { DemandMatrixData } from '@/types/demand';

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  warnings: string[];
}

export class ValidationService {
  /**
   * Validate enhanced matrix data structure
   */
  static validateEnhancedMatrixData(matrixData: DemandMatrixData): ValidationResult {
    const issues: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate core structure
      if (!matrixData.months || matrixData.months.length === 0) {
        issues.push('Months array is missing or empty');
      }

      if (!matrixData.skills || matrixData.skills.length === 0) {
        issues.push('Skills array is missing or empty');
      }

      // Validate revenue structure
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

      // Validate data point revenue fields
      const dataPointsWithRevenue = matrixData.dataPoints.filter(dp => 
        dp.suggestedRevenue !== undefined || dp.expectedLessSuggested !== undefined
      );

      if (dataPointsWithRevenue.length === 0) {
        warnings.push('No data points contain revenue information');
      }

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
}
