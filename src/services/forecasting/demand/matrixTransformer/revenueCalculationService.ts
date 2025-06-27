
import { suggestedRevenueCalculator } from '../calculators/SuggestedRevenueCalculator';
import { debugLog } from '../../logger';

/**
 * Revenue Calculation Service
 * Handles all revenue-related calculations for data points
 */
export class RevenueCalculationService {
  /**
   * Calculate revenue for a data point
   */
  static calculateDataPointRevenue(
    demandHours: number,
    skill: string,
    revenueContext?: any
  ): { suggestedRevenue: number; expectedLessSuggested: number } {
    let suggestedRevenue = 0;
    let expectedLessSuggested = 0;

    if (revenueContext?.includeRevenueCalculations && revenueContext.skillFeeRates) {
      try {
        suggestedRevenue = suggestedRevenueCalculator.calculateSuggestedRevenue(
          demandHours,
          skill,
          revenueContext.skillFeeRates
        );

        // For now, set expectedLessSuggested to 0 - will be calculated at client level
        expectedLessSuggested = 0;

        debugLog(`💰 [REVENUE] ${skill}: ${demandHours}h × fee rate = $${suggestedRevenue}`);
      } catch (revenueError) {
        console.warn(`⚠️ [REVENUE] Error calculating revenue for ${skill}:`, revenueError);
        // Continue with zero revenue rather than failing
      }
    }

    return { suggestedRevenue, expectedLessSuggested };
  }
}
