
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
      console.log(`💰 [REVENUE CALC SERVICE] Revenue calculations disabled or no context provided for ${skill}`);
      return {};
    }

    console.log(`💰 [REVENUE CALC SERVICE] Calculating revenue for ${demandHours}h of ${skill}`, { 
      hasSkillFeeRates: !!(revenueContext.skillFeeRates),
      skillFeeRatesSize: revenueContext.skillFeeRates?.size || 0,
      hasExpectedRevenue: !!(revenueContext.expectedRevenue),
      expectedRevenue: revenueContext.expectedRevenue,
      includeRevenueCalculations: revenueContext.includeRevenueCalculations
    });

    // Get skill fee rate from context with enhanced validation
    const skillFeeRatesMap = revenueContext.skillFeeRates || new Map();
    const skillFeeRate = skillFeeRatesMap.get(skill) || 75; // Default hourly rate
    const suggestedRevenue = demandHours * skillFeeRate;
    
    console.log(`💰 [REVENUE CALC SERVICE] Skill fee rate lookup:`, {
      skill,
      hasRateMap: !!(revenueContext.skillFeeRates),
      foundRate: skillFeeRatesMap.has(skill),
      rateUsed: skillFeeRate,
      isDefaultRate: !skillFeeRatesMap.has(skill)
    });
    
    // Get expected revenue from client apportionment if available
    let expectedRevenue = 0;
    if (revenueContext.expectedRevenue && typeof revenueContext.expectedRevenue === 'number') {
      expectedRevenue = revenueContext.expectedRevenue;
      console.log(`💰 [REVENUE CALC SERVICE] Using expected revenue from context: $${expectedRevenue}`);
    } else {
      console.log(`💰 [REVENUE CALC SERVICE] No expected revenue in context:`, {
        hasExpectedRevenue: !!(revenueContext.expectedRevenue),
        expectedRevenueType: typeof revenueContext.expectedRevenue,
        expectedRevenueValue: revenueContext.expectedRevenue
      });
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
