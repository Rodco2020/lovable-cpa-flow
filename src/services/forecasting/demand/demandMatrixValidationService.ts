
import { DemandMatrixData } from '@/types/demand';
import { revenueValidationService } from '../validation/RevenueValidationService';

/**
 * Demand Matrix Validation Service
 * Comprehensive validation logic for demand matrix data integrity
 */
export class DemandMatrixValidationService {
  /**
   * Enhanced validation with revenue-specific rules
   */
  static validateDemandMatrixData(matrixData: DemandMatrixData): string[] {
    const issues: string[] = [];

    try {
      // Standard validation rules
      if (!matrixData.months || matrixData.months.length !== 12) {
        issues.push(`Expected 12 months, got ${matrixData.months?.length || 0}`);
      }

      if (!matrixData.skills || matrixData.skills.length === 0) {
        issues.push('No skills found in demand matrix data');
      }

      if (!matrixData.dataPoints) {
        issues.push('No data points found in demand matrix');
        return issues;
      }

      // Enhanced data point validation
      let negativeHoursCount = 0;
      let nullTaskCount = 0;
      let invalidClientCount = 0;
      let revenueConsistencyIssues = 0;

      matrixData.dataPoints.forEach((point, index) => {
        // Standard validations
        if (point.demandHours < 0) {
          negativeHoursCount++;
        }

        if (point.taskCount < 0) {
          nullTaskCount++;
        }

        if (point.clientCount < 0) {
          invalidClientCount++;
        }

        // Enhanced task breakdown validation
        if (point.taskBreakdown) {
          point.taskBreakdown.forEach(task => {
            if (!task.clientId || !task.taskName) {
              issues.push(`Invalid task breakdown data for ${point.skillType} in ${point.month} (index ${index})`);
            }

            if (task.estimatedHours <= 0) {
              issues.push(`Invalid estimated hours for task ${task.taskName} in ${point.month}: ${task.estimatedHours}`);
            }

            // Revenue-related validations
            if (task.monthlyHours < 0) {
              issues.push(`Negative monthly hours for task ${task.taskName} in ${point.month}: ${task.monthlyHours}`);
            }

            if (task.skillType !== point.skillType) {
              issues.push(`Skill type mismatch in task breakdown for ${point.month}: expected ${point.skillType}, got ${task.skillType}`);
            }
          });

          // Validate task breakdown totals match data point totals
          const totalTaskHours = point.taskBreakdown.reduce((sum, task) => sum + task.monthlyHours, 0);
          if (Math.abs(totalTaskHours - point.demandHours) > 0.01) {
            revenueConsistencyIssues++;
          }
        }
      });

      // Report validation issues
      if (negativeHoursCount > 0) {
        issues.push(`Found ${negativeHoursCount} data points with negative demand hours`);
      }

      if (nullTaskCount > 0) {
        issues.push(`Found ${nullTaskCount} data points with invalid task counts`);
      }

      if (invalidClientCount > 0) {
        issues.push(`Found ${invalidClientCount} data points with invalid client counts`);
      }

      if (revenueConsistencyIssues > 0) {
        issues.push(`Found ${revenueConsistencyIssues} data points with inconsistent task breakdown totals`);
      }

      // Enhanced summary validation
      const calculatedTotal = matrixData.dataPoints.reduce((sum, point) => sum + point.demandHours, 0);
      const summaryTotal = matrixData.totalDemand;
      
      if (Math.abs(calculatedTotal - summaryTotal) > 0.01) {
        issues.push(`Total demand mismatch: calculated ${calculatedTotal}, summary ${summaryTotal}`);
      }

      // Revenue-specific validations
      if (matrixData.clientRevenue) {
        const negativeRevenueClients = Array.from(matrixData.clientRevenue.entries())
          .filter(([_, revenue]) => revenue < 0);
        
        if (negativeRevenueClients.length > 0) {
          issues.push(`Found ${negativeRevenueClients.length} clients with negative expected revenue`);
        }
      }

      if (matrixData.clientSuggestedRevenue) {
        const negativeSuggestedClients = Array.from(matrixData.clientSuggestedRevenue.entries())
          .filter(([_, revenue]) => revenue < 0);
        
        if (negativeSuggestedClients.length > 0) {
          issues.push(`Found ${negativeSuggestedClients.length} clients with negative suggested revenue`);
        }
      }

      // Validate skill fee rates if present
      if (matrixData.skillFeeRates) {
        const invalidFeeRates = Array.from(matrixData.skillFeeRates.entries())
          .filter(([_, rate]) => rate <= 0);
        
        if (invalidFeeRates.length > 0) {
          issues.push(`Found ${invalidFeeRates.length} skills with invalid fee rates (must be positive)`);
        }
      }

    } catch (error) {
      console.error('Error during validation:', error);
      issues.push(`Validation process error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return issues;
  }

  /**
   * Validate cached data before returning
   */
  static validateCachedData(data: DemandMatrixData): boolean {
    const validationResult = revenueValidationService.validateRevenueData(data);
    return validationResult.isValid && validationResult.errors.length === 0;
  }

  /**
   * Validate data for caching
   */
  static shouldCacheData(matrixData: DemandMatrixData): boolean {
    const standardIssues = this.validateDemandMatrixData(matrixData);
    const revenueValidation = revenueValidationService.validateRevenueData(matrixData);
    
    return standardIssues.length === 0 && revenueValidation.isValid;
  }
}
