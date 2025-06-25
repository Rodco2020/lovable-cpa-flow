
import { debugLog } from '../../logger';
import { DemandMatrixData } from '@/types/demand';

/**
 * Matrix Data Enricher
 * 
 * Focused service for enriching matrix data with additional
 * metadata, validation, and enhancement operations.
 * Extracted from matrixTransformerCore for better separation of concerns.
 */
export class MatrixDataEnricher {
  /**
   * Enrich matrix data with validation and metadata
   */
  static enrichMatrixData(
    baseMatrixData: DemandMatrixData,
    processingMetrics: {
      processingTime: number;
      validTasks: number;
      invalidTasks: number;
      resolvedTasks: number;
    }
  ): DemandMatrixData {
    console.log('🔧 [MATRIX ENRICHER] Starting data enrichment process...');

    try {
      // Validate enhanced data structure
      const validationResult = this.validateEnhancedMatrixData(baseMatrixData);
      if (!validationResult.isValid) {
        console.warn('⚠️ [MATRIX ENRICHER] Data validation issues:', validationResult.issues);
      }

      // Add processing metadata
      const enrichedData = {
        ...baseMatrixData,
        metadata: {
          generatedAt: new Date().toISOString(),
          processingTime: processingMetrics.processingTime,
          validTasks: processingMetrics.validTasks,
          invalidTasks: processingMetrics.invalidTasks,
          resolvedTasks: processingMetrics.resolvedTasks,
          dataQuality: {
            validationScore: this.calculateValidationScore(validationResult),
            completenessScore: this.calculateCompletenessScore(baseMatrixData),
            consistencyScore: this.calculateConsistencyScore(baseMatrixData)
          }
        }
      };

      console.log('✅ [MATRIX ENRICHER] Data enrichment completed successfully');
      return enrichedData;

    } catch (error) {
      console.error('❌ [MATRIX ENRICHER] Error during data enrichment:', error);
      return baseMatrixData; // Return original data if enrichment fails
    }
  }

  /**
   * Validate enhanced matrix data structure
   */
  private static validateEnhancedMatrixData(matrixData: DemandMatrixData): {
    isValid: boolean;
    issues: string[];
    warnings: string[];
  } {
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

      // Validate data consistency
      const totalDataPointHours = matrixData.dataPoints.reduce((sum, dp) => sum + (dp.demandHours || 0), 0);
      if (Math.abs(totalDataPointHours - matrixData.totalDemand) > 0.01) {
        issues.push('Total demand mismatch between data points and summary');
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

  /**
   * Calculate validation score based on validation results
   */
  private static calculateValidationScore(validationResult: { isValid: boolean; issues: string[]; warnings: string[] }): number {
    if (validationResult.isValid && validationResult.warnings.length === 0) {
      return 1.0; // Perfect score
    }
    
    const issueWeight = 0.3;
    const warningWeight = 0.1;
    
    const deductions = (validationResult.issues.length * issueWeight) + (validationResult.warnings.length * warningWeight);
    return Math.max(0, 1.0 - deductions);
  }

  /**
   * Calculate completeness score based on data availability
   */
  private static calculateCompletenessScore(matrixData: DemandMatrixData): number {
    let score = 0;
    let maxScore = 0;

    // Check for presence of core data
    if (matrixData.months && matrixData.months.length > 0) score += 0.2;
    maxScore += 0.2;

    if (matrixData.skills && matrixData.skills.length > 0) score += 0.2;
    maxScore += 0.2;

    if (matrixData.dataPoints && matrixData.dataPoints.length > 0) score += 0.2;
    maxScore += 0.2;

    if (matrixData.clientRevenue && matrixData.clientRevenue.size > 0) score += 0.2;
    maxScore += 0.2;

    if (matrixData.revenueTotals) score += 0.2;
    maxScore += 0.2;

    return maxScore > 0 ? score / maxScore : 0;
  }

  /**
   * Calculate consistency score based on data relationships
   */
  private static calculateConsistencyScore(matrixData: DemandMatrixData): number {
    let consistencyChecks = 0;
    let passedChecks = 0;

    // Check 1: Total demand consistency
    consistencyChecks++;
    const totalDataPointHours = matrixData.dataPoints.reduce((sum, dp) => sum + (dp.demandHours || 0), 0);
    if (Math.abs(totalDataPointHours - matrixData.totalDemand) < 0.01) {
      passedChecks++;
    }

    // Check 2: Client count consistency
    consistencyChecks++;
    const uniqueClients = new Set();
    matrixData.dataPoints.forEach(dp => {
      if (dp.taskBreakdown) {
        dp.taskBreakdown.forEach((task: any) => {
          if (task.clientName) uniqueClients.add(task.clientName);
        });
      }
    });
    if (uniqueClients.size === matrixData.totalClients) {
      passedChecks++;
    }

    // Check 3: Skills consistency
    consistencyChecks++;
    const dataPointSkills = new Set(matrixData.dataPoints.map(dp => dp.skillType));
    const declaredSkills = new Set(matrixData.skills);
    if (dataPointSkills.size <= declaredSkills.size) {
      passedChecks++;
    }

    return consistencyChecks > 0 ? passedChecks / consistencyChecks : 1;
  }

  /**
   * Generate processing summary for logging
   */
  static generateProcessingSummary(
    matrixData: DemandMatrixData,
    processingTime: number
  ): string {
    const revenueTotals = matrixData.revenueTotals;
    
    return `✅ [MATRIX ENRICHER] Enhanced matrix generated in ${processingTime.toFixed(2)}ms: ${matrixData.months.length} months, ${matrixData.skills.length} skills, ${matrixData.dataPoints.length} data points, total demand: ${matrixData.totalDemand}h, clients: ${matrixData.totalClients}, revenue totals: $${revenueTotals?.totalSuggestedRevenue?.toFixed(2) || 0}`;
  }

  /**
   * Check for performance warnings
   */
  static checkPerformanceWarnings(processingTime: number): void {
    if (processingTime > 2000) {
      console.warn(`⚠️ [MATRIX ENRICHER] Processing time exceeded 2s target: ${processingTime.toFixed(2)}ms`);
    }
  }
}
