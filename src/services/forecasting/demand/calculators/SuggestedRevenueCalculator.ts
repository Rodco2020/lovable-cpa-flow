
/**
 * Suggested Revenue Calculator
 * 
 * Provides calculation logic for determining suggested revenue based on demand hours
 * and skill-specific fee rates. This calculator supports the "Total Suggested Revenue"
 * column in the Demand Forecast Matrix.
 * 
 * Key Features:
 * - Skill-based revenue calculation using fee rates
 * - Comprehensive error handling with fallback mechanisms
 * - Support for bulk calculations with performance optimization
 * - Detailed logging for debugging and audit trails
 */

import { getDefaultFeeRates, type SkillFeeRateMap } from '@/services/skills/feeRateService';

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
  }

  public static getInstance(): SuggestedRevenueCalculator {
    if (!SuggestedRevenueCalculator.instance) {
      SuggestedRevenueCalculator.instance = new SuggestedRevenueCalculator();
    }
    return SuggestedRevenueCalculator.instance;
  }

  /**
   * Calculate suggested revenue for a specific skill and demand hours
   * @param demandHours - Number of hours of demand
   * @param skillName - Name of the skill
   * @param skillFeeRates - Map of skill names to fee rates
   * @returns Calculated suggested revenue
   */
  public calculateSuggestedRevenue(
    demandHours: number,
    skillName: string,
    skillFeeRates: Map<string, number>
  ): number {
    try {
      // Input validation
      this.validateInputs(demandHours, skillName, skillFeeRates);

      // Get fee rate with fallback logic
      const feeRate = this.getFeeRateWithFallback(skillName, skillFeeRates);

      // Calculate revenue
      const suggestedRevenue = demandHours * feeRate;

      console.log(`Calculated suggested revenue for ${skillName}: ${demandHours} hours × $${feeRate}/hour = $${suggestedRevenue}`);

      return Number(suggestedRevenue.toFixed(2));
    } catch (error) {
      console.error('Error calculating suggested revenue:', error);
      throw new SuggestedRevenueCalculatorError(
        `Failed to calculate suggested revenue for skill "${skillName}": ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CALCULATION_ERROR'
      );
    }
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
      // Input validation
      if (typeof expectedRevenue !== 'number' || isNaN(expectedRevenue)) {
        throw new Error('Expected revenue must be a valid number');
      }
      if (typeof suggestedRevenue !== 'number' || isNaN(suggestedRevenue)) {
        throw new Error('Suggested revenue must be a valid number');
      }

      const difference = expectedRevenue - suggestedRevenue;
      
      console.log(`Calculated expected less suggested: $${expectedRevenue} - $${suggestedRevenue} = $${difference}`);

      return Number(difference.toFixed(2));
    } catch (error) {
      console.error('Error calculating expected less suggested:', error);
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
   * Bulk calculate suggested revenue for multiple skills
   * @param demandData - Array of demand data with skill and hours
   * @param skillFeeRates - Map of skill names to fee rates
   * @returns Array of calculation results
   */
  public bulkCalculateSuggestedRevenue(
    demandData: Array<{ skillName: string; demandHours: number }>,
    skillFeeRates: Map<string, number>
  ): SuggestedRevenueCalculation[] {
    const results: SuggestedRevenueCalculation[] = [];
    const errors: string[] = [];

    for (const data of demandData) {
      try {
        const calculation = this.calculateSuggestedRevenueDetailed(
          data.demandHours,
          data.skillName,
          skillFeeRates
        );
        results.push(calculation);
      } catch (error) {
        const errorMessage = `Error calculating for ${data.skillName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMessage);
        console.warn(errorMessage);
        
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

    if (errors.length > 0) {
      console.warn(`Bulk calculation completed with ${errors.length} errors:`, errors);
    }

    return results;
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

  private validateInputs(
    demandHours: number,
    skillName: string,
    skillFeeRates: Map<string, number>
  ): void {
    if (typeof demandHours !== 'number' || isNaN(demandHours) || demandHours < 0) {
      throw new Error('Demand hours must be a non-negative number');
    }
    if (typeof skillName !== 'string' || skillName.trim().length === 0) {
      throw new Error('Skill name must be a non-empty string');
    }
    if (!(skillFeeRates instanceof Map)) {
      throw new Error('Skill fee rates must be a Map instance');
    }
  }

  private getFeeRateWithFallback(
    skillName: string,
    skillFeeRates: Map<string, number>
  ): number {
    // Try exact match first
    let feeRate = skillFeeRates.get(skillName);
    
    if (feeRate !== undefined && feeRate > 0) {
      return feeRate;
    }

    // Try case-insensitive match
    for (const [key, value] of skillFeeRates.entries()) {
      if (key.toLowerCase() === skillName.toLowerCase() && value > 0) {
        console.log(`Using case-insensitive match for skill "${skillName}" -> "${key}"`);
        return value;
      }
    }

    // Try fallback rates
    feeRate = this.fallbackRates[skillName];
    if (feeRate !== undefined && feeRate > 0) {
      console.log(`Using fallback rate for skill "${skillName}": $${feeRate}/hour`);
      return feeRate;
    }

    // Try case-insensitive fallback match
    for (const [key, value] of Object.entries(this.fallbackRates)) {
      if (key.toLowerCase() === skillName.toLowerCase() && value > 0) {
        console.log(`Using case-insensitive fallback match for skill "${skillName}" -> "${key}"`);
        return value;
      }
    }

    // Final fallback - use default rate
    const defaultRate = 75.00;
    console.warn(`No fee rate found for skill "${skillName}", using default rate: $${defaultRate}/hour`);
    return defaultRate;
  }
}

// Export singleton instance
export const suggestedRevenueCalculator = SuggestedRevenueCalculator.getInstance();
