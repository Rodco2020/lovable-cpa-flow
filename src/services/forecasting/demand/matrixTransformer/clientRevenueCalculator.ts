
import { DemandDataPoint } from '@/types/demand';

/**
 * Client Revenue Calculator
 * Handles revenue calculations for clients and demand data points
 */
export class ClientRevenueCalculator {
  private static readonly DEFAULT_REVENUE_MULTIPLIER = 1.2;

  /**
   * Get expected revenue for a demand data point
   */
  async getExpectedRevenue(dataPoint: DemandDataPoint): Promise<number> {
    // Calculate expected revenue based on suggested revenue
    // This is a simplified calculation that can be enhanced
    const suggestedRevenue = dataPoint.suggestedRevenue || 0;
    return suggestedRevenue * ClientRevenueCalculator.DEFAULT_REVENUE_MULTIPLIER;
  }

  /**
   * Calculate expected revenue for a client
   */
  async calculateClientRevenue(clientId: string, demandHours: number, feeRate: number): Promise<number> {
    return demandHours * feeRate * ClientRevenueCalculator.DEFAULT_REVENUE_MULTIPLIER;
  }
}
