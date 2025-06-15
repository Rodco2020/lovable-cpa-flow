/**
 * Suggested Revenue Calculator
 * 
 * Enhanced with comprehensive error handling, validation, and logging
 */

import { getDefaultFeeRates, type SkillFeeRateMap } from '@/services/skills/feeRateService';
import { errorHandlingService } from '@/services/forecasting/validation/ErrorHandlingService';
import { loggingService } from '@/services/forecasting/validation/LoggingService';

export class SuggestedRevenueCalculatorError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'SuggestedRevenueCalculatorError';
  }
}

export interface SuggestedRevenueCalculation {
  skillName: string;
  demandHours: number;
  feeRate: number;
  suggestedRevenue: number;
  isUsingFallback: boolean;
  calculationNotes?: string;
}

export class SuggestedRevenueCalculator {
  private static instance: SuggestedRevenueCalculator;
  private fallbackRates: SkillFeeRateMap;

  private constructor() {
    this.fallbackRates = getDefaultFeeRates();
    loggingService.info('initialize', 'SuggestedRevenueCalculator', 'Calculator initialized with fallback rates');
  }

  public static getInstance(): SuggestedRevenueCalculator {
    if (!SuggestedRevenueCalculator.instance) {
      SuggestedRevenueCalculator.instance = new SuggestedRevenueCalculator();
    }
    return SuggestedRevenueCalculator.instance;
  }

  /**
   * Calculate suggested revenue with enhanced error handling
   */
  public calculateSuggestedRevenue(
    demandHours: number,
    skillName: string,
    skillFeeRates: Map<string, number>
  ): number {
    const timerId = loggingService.startTimer('calculateSuggestedRevenue');
    
    try {
      loggingService.revenue('calculateSuggestedRevenue', 'SuggestedRevenueCalculator', 
        `Calculating revenue for skill: ${skillName}`, 
        { demandHours, skillName }
      );

      // Input validation with detailed logging
      this.validateInputs(demandHours, skillName, skillFeeRates);

      // Get fee rate with fallback logic
      const feeRate = this.getFeeRateWithFallback(skillName, skillFeeRates);

      // Calculate revenue
      const suggestedRevenue = demandHours * feeRate;

      loggingService.revenue('calculateSuggestedRevenue', 'SuggestedRevenueCalculator',
        `Revenue calculated successfully`,
        { 
          skillName, 
          demandHours, 
          feeRate, 
          suggestedRevenue: Number(suggestedRevenue.toFixed(2))
        }
      );

      loggingService.endTimer(timerId, 'calculateSuggestedRevenue', 'SuggestedRevenueCalculator', true);

      return Number(suggestedRevenue.toFixed(2));

    } catch (error) {
      loggingService.endTimer(timerId, 'calculateSuggestedRevenue', 'SuggestedRevenueCalculator', false);
      
      loggingService.error('calculateSuggestedRevenue', 'SuggestedRevenueCalculator',
        'Revenue calculation failed', error as Error, { skillName, demandHours }
      );

      // Use error handling service for recovery
      const recovery = errorHandlingService.handleError(
        error as Error,
        {
          operation: 'calculateSuggestedRevenue',
          component: 'SuggestedRevenueCalculator',
          skillName,
          timestamp: new Date()
        },
        true
      );

      if (recovery.success && typeof recovery.fallbackValue === 'number') {
        loggingService.warn('calculateSuggestedRevenue', 'SuggestedRevenueCalculator',
          `Using recovery value: ${recovery.fallbackValue}`, { recovery }
        );
        return recovery.fallbackValue;
      }

      throw new SuggestedRevenueCalculatorError(
        `Failed to calculate suggested revenue for skill "${skillName}": ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CALCULATION_ERROR'
      );
    }
  }

  /**
   * Enhanced bulk calculation with progress tracking
   */
  public bulkCalculateSuggestedRevenue(
    demandData: Array<{ skillName: string; demandHours: number }>,
    skillFeeRates: Map<string, number>
  ): SuggestedRevenueCalculation[] {
    const timerId = loggingService.startTimer('bulkCalculateSuggestedRevenue');
    
    loggingService.revenue('bulkCalculateSuggestedRevenue', 'SuggestedRevenueCalculator',
      `Starting bulk calculation for ${demandData.length} skills`
    );

    const results: SuggestedRevenueCalculation[] = [];
    const errors: string[] = [];
    let successCount = 0;

    for (let i = 0; i < demandData.length; i++) {
      const data = demandData[i];
      
      try {
        const calculation = this.calculateSuggestedRevenueDetailed(
          data.demandHours,
          data.skillName,
          skillFeeRates
        );
        results.push(calculation);
        successCount++;

        // Log progress for large datasets
        if (demandData.length > 50 && (i + 1) % 20 === 0) {
          loggingService.performanceMilestone('bulkCalculateSuggestedRevenue', 'SuggestedRevenueCalculator',
            `Processed ${i + 1}/${demandData.length} calculations`
          );
        }

      } catch (error) {
        const errorMessage = `Error calculating for ${data.skillName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMessage);
        
        loggingService.warn('bulkCalculateSuggestedRevenue', 'SuggestedRevenueCalculator',
          errorMessage, { skillName: data.skillName, demandHours: data.demandHours }
        );
        
        // Add fallback calculation with zero revenue
        results.push({
          skillName: data.skillName,
          demandHours: data.demandHours,
          feeRate: 0,
          suggestedRevenue: 0,
          isUsingFallback: true,
          calculationNotes: `Error in calculation: ${errorMessage}`
        });
      }
    }

    loggingService.endTimer(timerId, 'bulkCalculateSuggestedRevenue', 'SuggestedRevenueCalculator', errors.length === 0);

    loggingService.revenue('bulkCalculateSuggestedRevenue', 'SuggestedRevenueCalculator',
      `Bulk calculation completed`,
      {
        totalItems: demandData.length,
        successCount,
        errorCount: errors.length,
        totalRevenue: this.getTotalSuggestedRevenue(results)
      }
    );

    if (errors.length > 0) {
      loggingService.warn('bulkCalculateSuggestedRevenue', 'SuggestedRevenueCalculator',
        `${errors.length} errors encountered during bulk calculation`, { errors }
      );
    }

    return results;
  }

  /**
   * Enhanced validation with detailed logging
   */
  private validateInputs(
    demandHours: number,
    skillName: string,
    skillFeeRates: Map<string, number>
  ): void {
    const validationErrors: string[] = [];

    if (typeof demandHours !== 'number' || isNaN(demandHours) || demandHours < 0) {
      validationErrors.push('Demand hours must be a non-negative number');
    }
    
    if (typeof skillName !== 'string' || skillName.trim().length === 0) {
      validationErrors.push('Skill name must be a non-empty string');
    }
    
    if (!(skillFeeRates instanceof Map)) {
      validationErrors.push('Skill fee rates must be a Map instance');
    }

    if (validationErrors.length > 0) {
      loggingService.validation('error', 'validateInputs', 'SuggestedRevenueCalculator',
        'Input validation failed', 
        { validationErrors, demandHours, skillName }
      );
      
      throw new Error(validationErrors.join('; '));
    }

    loggingService.validation('debug', 'validateInputs', 'SuggestedRevenueCalculator',
      'Input validation passed', { demandHours, skillName }
    );
  }

  /**
   * Enhanced fee rate retrieval with fallback logging
   */
  private getFeeRateWithFallback(
    skillName: string,
    skillFeeRates: Map<string, number>
  ): number {
    // Try exact match first
    let feeRate = skillFeeRates.get(skillName);
    
    if (feeRate !== undefined && feeRate > 0) {
      loggingService.debug('getFeeRateWithFallback', 'SuggestedRevenueCalculator',
        `Using configured rate for skill: ${skillName}`,
        { skillName, feeRate }
      );
      return feeRate;
    }

    // Try case-insensitive match
    for (const [key, value] of skillFeeRates.entries()) {
      if (key.toLowerCase() === skillName.toLowerCase() && value > 0) {
        loggingService.warn('getFeeRateWithFallback', 'SuggestedRevenueCalculator',
          `Using case-insensitive match for skill "${skillName}" -> "${key}"`,
          { originalSkill: skillName, matchedSkill: key, feeRate: value }
        );
        return value;
      }
    }

    // Try fallback rates
    feeRate = this.fallbackRates[skillName];
    if (feeRate !== undefined && feeRate > 0) {
      loggingService.warn('getFeeRateWithFallback', 'SuggestedRevenueCalculator',
        `Using fallback rate for skill: ${skillName}`,
        { skillName, feeRate }
      );
      return feeRate;
    }

    // Try case-insensitive fallback match
    for (const [key, value] of Object.entries(this.fallbackRates)) {
      if (key.toLowerCase() === skillName.toLowerCase() && value > 0) {
        loggingService.warn('getFeeRateWithFallback', 'SuggestedRevenueCalculator',
          `Using case-insensitive fallback match for skill "${skillName}" -> "${key}"`,
          { originalSkill: skillName, matchedSkill: key, feeRate: value }
        );
        return value;
      }
    }

    // Final fallback - use default rate
    const defaultRate = 75.00;
    loggingService.warn('getFeeRateWithFallback', 'SuggestedRevenueCalculator',
      `No fee rate found for skill "${skillName}", using default rate`,
      { skillName, defaultRate }
    );
    
    return defaultRate;
  }

  /**
   * Calculate expected less suggested difference
   * @param expectedRevenue - Expected revenue amount
   * @param suggestedRevenue - Suggested revenue amount
   * @returns Difference (expected - suggested)
   */
  public calculateExpectedLessSuggested(
    expectedRevenue: number,
    suggestedRevenue: number
  ): number {
    try {
      if (typeof expectedRevenue !== 'number' || isNaN(expectedRevenue)) {
        throw new Error('Expected revenue must be a valid number');
      }
      if (typeof suggestedRevenue !== 'number' || isNaN(suggestedRevenue)) {
        throw new Error('Suggested revenue must be a valid number');
      }

      const difference = expectedRevenue - suggestedRevenue;
      
      loggingService.debug('calculateExpectedLessSuggested', 'SuggestedRevenueCalculator',
        'Calculated revenue difference',
        { expectedRevenue, suggestedRevenue, difference }
      );

      return Number(difference.toFixed(2));
    } catch (error) {
      loggingService.error('calculateExpectedLessSuggested', 'SuggestedRevenueCalculator',
        'Error calculating expected less suggested', error as Error
      );
      throw new SuggestedRevenueCalculatorError(
        `Failed to calculate expected less suggested: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'COMPARISON_ERROR'
      );
    }
  }

  /**
   * Calculate suggested revenue with detailed information
   * @param demandHours - Number of hours of demand
   * @param skillName - Name of the skill
   * @param skillFeeRates - Map of skill names to fee rates
   * @returns Detailed calculation result
   */
  public calculateSuggestedRevenueDetailed(
    demandHours: number,
    skillName: string,
    skillFeeRates: Map<string, number>
  ): SuggestedRevenueCalculation {
    try {
      this.validateInputs(demandHours, skillName, skillFeeRates);

      const originalFeeRate = skillFeeRates.get(skillName);
      const isUsingFallback = originalFeeRate === undefined;
      const feeRate = this.getFeeRateWithFallback(skillName, skillFeeRates);
      const suggestedRevenue = Number((demandHours * feeRate).toFixed(2));

      return {
        skillName,
        demandHours,
        feeRate,
        suggestedRevenue,
        isUsingFallback,
        calculationNotes: isUsingFallback 
          ? `Used fallback rate for skill "${skillName}" (original rate not found)`
          : undefined
      };
    } catch (error) {
      throw new SuggestedRevenueCalculatorError(
        `Failed to calculate detailed suggested revenue for skill "${skillName}": ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DETAILED_CALCULATION_ERROR'
      );
    }
  }

  /**
   * Get total suggested revenue from multiple calculations
   * @param calculations - Array of calculation results
   * @returns Total suggested revenue
   */
  public getTotalSuggestedRevenue(calculations: SuggestedRevenueCalculation[]): number {
    const total = calculations.reduce((sum, calc) => sum + calc.suggestedRevenue, 0);
    return Number(total.toFixed(2));
  }
}

// Export singleton instance
export const suggestedRevenueCalculator = SuggestedRevenueCalculator.getInstance();
