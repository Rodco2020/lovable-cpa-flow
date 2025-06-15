
/**
 * Revenue Validation Service
 * 
 * Provides comprehensive validation for revenue-related calculations and data integrity
 * in the Demand Matrix. This service validates skill fee rates, client revenue data,
 * and calculation results to ensure data consistency and accuracy.
 */

import { DemandMatrixData } from '@/types/demand';
import { getDefaultFeeRates } from '@/services/skills/feeRateService';

export interface RevenueValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  missingSkillRates: string[];
  inconsistentData: Array<{
    type: 'client' | 'skill' | 'calculation';
    issue: string;
    affectedItem: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export interface RevenueValidationOptions {
  strictMode?: boolean;
  validateSkillRates?: boolean;
  validateClientRevenue?: boolean;
  validateCalculations?: boolean;
  allowFallbackRates?: boolean;
}

export class RevenueValidationService {
  private static instance: RevenueValidationService;
  private defaultFeeRates = getDefaultFeeRates();

  private constructor() {}

  public static getInstance(): RevenueValidationService {
    if (!RevenueValidationService.instance) {
      RevenueValidationService.instance = new RevenueValidationService();
    }
    return RevenueValidationService.instance;
  }

  /**
   * Validate revenue data comprehensively
   */
  public validateRevenueData(
    demandData: DemandMatrixData,
    options: RevenueValidationOptions = {}
  ): RevenueValidationResult {
    const opts = {
      strictMode: false,
      validateSkillRates: true,
      validateClientRevenue: true,
      validateCalculations: true,
      allowFallbackRates: true,
      ...options
    };

    console.log('🔍 [REVENUE VALIDATION] Starting comprehensive validation', opts);

    const result: RevenueValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      missingSkillRates: [],
      inconsistentData: []
    };

    try {
      // Validate skill fee rates
      if (opts.validateSkillRates) {
        this.validateSkillFeeRates(demandData, result, opts);
      }

      // Validate client revenue data
      if (opts.validateClientRevenue) {
        this.validateClientRevenueData(demandData, result, opts);
      }

      // Validate calculation consistency
      if (opts.validateCalculations) {
        this.validateCalculationConsistency(demandData, result, opts);
      }

      // Additional data integrity checks
      this.validateDataIntegrity(demandData, result, opts);

      // Determine overall validity
      result.isValid = result.errors.length === 0 && (
        !opts.strictMode || result.warnings.length === 0
      );

      console.log('✅ [REVENUE VALIDATION] Validation completed', {
        isValid: result.isValid,
        errors: result.errors.length,
        warnings: result.warnings.length,
        missingSkillRates: result.missingSkillRates.length
      });

    } catch (error) {
      console.error('❌ [REVENUE VALIDATION] Validation failed:', error);
      result.isValid = false;
      result.errors.push(`Validation process failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Validate skill fee rates availability and consistency
   */
  private validateSkillFeeRates(
    demandData: DemandMatrixData,
    result: RevenueValidationResult,
    options: RevenueValidationOptions
  ): void {
    const skillsInData = new Set(demandData.skills);
    const skillFeeRates = demandData.skillFeeRates || new Map();

    // Check for missing skill rates
    for (const skill of skillsInData) {
      const hasRate = skillFeeRates.has(skill);
      const hasFallback = this.defaultFeeRates[skill] !== undefined;

      if (!hasRate && !hasFallback) {
        result.missingSkillRates.push(skill);
        result.errors.push(`No fee rate found for skill "${skill}" and no fallback available`);
        result.inconsistentData.push({
          type: 'skill',
          issue: 'Missing fee rate',
          affectedItem: skill,
          severity: 'high'
        });
      } else if (!hasRate && hasFallback && options.allowFallbackRates) {
        result.warnings.push(`Using fallback fee rate for skill "${skill}"`);
        result.suggestions.push(`Configure specific fee rate for skill "${skill}" to improve accuracy`);
      }

      // Validate rate values
      const rate = skillFeeRates.get(skill);
      if (rate !== undefined) {
        if (rate <= 0) {
          result.errors.push(`Invalid fee rate for skill "${skill}": ${rate} (must be positive)`);
        } else if (rate > 1000) {
          result.warnings.push(`Very high fee rate for skill "${skill}": $${rate}/hour`);
        } else if (rate < 10) {
          result.warnings.push(`Very low fee rate for skill "${skill}": $${rate}/hour`);
        }
      }
    }
  }

  /**
   * Validate client revenue data consistency
   */
  private validateClientRevenueData(
    demandData: DemandMatrixData,
    result: RevenueValidationResult,
    options: RevenueValidationOptions
  ): void {
    if (!demandData.clientRevenue || !demandData.clientSuggestedRevenue) {
      result.warnings.push('Client revenue data not available - revenue analysis features will be limited');
      return;
    }

    const expectedClients = new Set(demandData.clientRevenue.keys());
    const suggestedClients = new Set(demandData.clientSuggestedRevenue.keys());

    // Check for mismatched client sets
    for (const client of expectedClients) {
      if (!suggestedClients.has(client)) {
        result.inconsistentData.push({
          type: 'client',
          issue: 'Missing suggested revenue',
          affectedItem: client,
          severity: 'medium'
        });
        result.warnings.push(`Client "${client}" has expected revenue but no suggested revenue calculated`);
      }
    }

    for (const client of suggestedClients) {
      if (!expectedClients.has(client)) {
        result.inconsistentData.push({
          type: 'client',
          issue: 'Missing expected revenue',
          affectedItem: client,
          severity: 'medium'
        });
        result.warnings.push(`Client "${client}" has suggested revenue but no expected revenue configured`);
      }
    }

    // Validate revenue values
    for (const [client, expectedRevenue] of demandData.clientRevenue.entries()) {
      if (expectedRevenue < 0) {
        result.errors.push(`Negative expected revenue for client "${client}": ${expectedRevenue}`);
      }

      const suggestedRevenue = demandData.clientSuggestedRevenue.get(client) || 0;
      if (suggestedRevenue < 0) {
        result.errors.push(`Negative suggested revenue for client "${client}": ${suggestedRevenue}`);
      }

      // Check for large discrepancies
      if (expectedRevenue > 0 && suggestedRevenue > 0) {
        const difference = Math.abs(expectedRevenue - suggestedRevenue);
        const percentageDiff = (difference / Math.max(expectedRevenue, suggestedRevenue)) * 100;

        if (percentageDiff > 50) {
          result.warnings.push(
            `Large revenue discrepancy for client "${client}": ${percentageDiff.toFixed(1)}% difference`
          );
          result.suggestions.push(`Review fee rates or expected revenue for client "${client}"`);
        }
      }
    }
  }

  /**
   * Validate calculation consistency and accuracy
   */
  private validateCalculationConsistency(
    demandData: DemandMatrixData,
    result: RevenueValidationResult,
    options: RevenueValidationOptions
  ): void {
    // Validate revenue totals consistency
    if (demandData.revenueTotals) {
      const calculatedExpected = demandData.clientRevenue ? 
        Array.from(demandData.clientRevenue.values()).reduce((sum, val) => sum + val, 0) : 0;
      
      const calculatedSuggested = demandData.clientSuggestedRevenue ?
        Array.from(demandData.clientSuggestedRevenue.values()).reduce((sum, val) => sum + val, 0) : 0;

      if (Math.abs(calculatedExpected - demandData.revenueTotals.totalExpectedRevenue) > 0.01) {
        result.inconsistentData.push({
          type: 'calculation',
          issue: 'Revenue total mismatch',
          affectedItem: 'Total Expected Revenue',
          severity: 'high'
        });
        result.errors.push(
          `Expected revenue total mismatch: calculated ${calculatedExpected}, stored ${demandData.revenueTotals.totalExpectedRevenue}`
        );
      }

      if (Math.abs(calculatedSuggested - demandData.revenueTotals.totalSuggestedRevenue) > 0.01) {
        result.inconsistentData.push({
          type: 'calculation',
          issue: 'Revenue total mismatch',
          affectedItem: 'Total Suggested Revenue',
          severity: 'high'
        });
        result.errors.push(
          `Suggested revenue total mismatch: calculated ${calculatedSuggested}, stored ${demandData.revenueTotals.totalSuggestedRevenue}`
        );
      }
    }

    // Validate hourly rates consistency
    if (demandData.clientHourlyRates && demandData.clientTotals) {
      for (const [client, hourlyRate] of demandData.clientHourlyRates.entries()) {
        const totalHours = demandData.clientTotals.get(client) || 0;
        const expectedRevenue = demandData.clientRevenue?.get(client) || 0;

        if (totalHours > 0 && expectedRevenue > 0) {
          const calculatedRate = expectedRevenue / totalHours;
          const rateDifference = Math.abs(calculatedRate - hourlyRate);

          if (rateDifference > 1) {
            result.warnings.push(
              `Hourly rate inconsistency for client "${client}": calculated $${calculatedRate.toFixed(2)}/h, stored $${hourlyRate.toFixed(2)}/h`
            );
          }
        }
      }
    }
  }

  /**
   * Validate overall data integrity
   */
  private validateDataIntegrity(
    demandData: DemandMatrixData,
    result: RevenueValidationResult,
    options: RevenueValidationOptions
  ): void {
    // Check for data completeness
    if (demandData.dataPoints.length === 0) {
      result.errors.push('No demand data points available');
      return;
    }

    // Validate data point consistency
    let inconsistentDataPoints = 0;
    for (const dataPoint of demandData.dataPoints) {
      if (dataPoint.taskBreakdown) {
        const taskHours = dataPoint.taskBreakdown.reduce((sum, task) => sum + task.monthlyHours, 0);
        if (Math.abs(taskHours - dataPoint.demandHours) > 0.01) {
          inconsistentDataPoints++;
        }
      }
    }

    if (inconsistentDataPoints > 0) {
      result.warnings.push(`Found ${inconsistentDataPoints} data points with inconsistent task breakdowns`);
    }

    // Check for reasonable data ranges
    const totalDemand = demandData.totalDemand;
    if (totalDemand > 100000) {
      result.warnings.push(`Very high total demand: ${totalDemand} hours - please verify data accuracy`);
    } else if (totalDemand === 0) {
      result.warnings.push('No demand hours found in the dataset');
    }
  }

  /**
   * Get validation recommendations based on results
   */
  public getValidationRecommendations(validationResult: RevenueValidationResult): string[] {
    const recommendations: string[] = [];

    if (validationResult.missingSkillRates.length > 0) {
      recommendations.push(
        `Configure fee rates for ${validationResult.missingSkillRates.length} missing skills to improve revenue accuracy`
      );
    }

    const highSeverityIssues = validationResult.inconsistentData.filter(issue => issue.severity === 'high');
    if (highSeverityIssues.length > 0) {
      recommendations.push('Address high-severity data inconsistencies before proceeding with revenue analysis');
    }

    if (validationResult.warnings.length > 5) {
      recommendations.push('Consider reviewing data quality processes to reduce validation warnings');
    }

    return [...recommendations, ...validationResult.suggestions];
  }
}

// Export singleton instance
export const revenueValidationService = RevenueValidationService.getInstance();
