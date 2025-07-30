
/**
 * Revenue Calculation Service
 * Handles revenue calculations for data points
 * FIXED: Now properly calculates both suggested and expected revenue
 */
export class RevenueCalculationService {
  static calculateDataPointRevenue(
    demandHours: number,
    skill: string,
    revenueContext?: any
  ): { suggestedRevenue?: number; expectedRevenue?: number; expectedLessSuggested?: number } {
    if (!revenueContext || !revenueContext.includeRevenueCalculations) {
      console.log(`💰 [REVENUE CALC SERVICE] Revenue calculations disabled or no context provided`);
      return {};
    }

    console.log(`💰 [REVENUE CALC SERVICE] Calculating revenue for ${demandHours}h of ${skill}`, { revenueContext });

    // Get skill fee rate from context
    const skillFeeRatesMap = revenueContext.skillFeeRates || new Map();
    const skillFeeRate = skillFeeRatesMap.get(skill) || 75; // Default hourly rate
    const suggestedRevenue = demandHours * skillFeeRate;
    
    // Get expected revenue from client apportionment if available
    let expectedRevenue = 0;
    if (revenueContext.expectedRevenue && typeof revenueContext.expectedRevenue === 'number') {
      expectedRevenue = revenueContext.expectedRevenue;
    }
    
    const expectedLessSuggested = expectedRevenue - suggestedRevenue;
    
    console.log(`💰 [REVENUE CALC SERVICE] Result:`, {
      skill,
      demandHours,
      skillFeeRate: `$${skillFeeRate}/hr`,
      suggestedRevenue: `$${suggestedRevenue}`,
      expectedRevenue: `$${expectedRevenue}`,
      expectedLessSuggested: `$${expectedLessSuggested}`
    });
    
    return {
      suggestedRevenue,
      expectedRevenue,
      expectedLessSuggested
    };
  }
}
