
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

  /**
   * Build client revenue map from client data
   */
  static buildClientRevenueMap(clientsData: Array<{ id: string; legal_name: string; expected_monthly_revenue: number }>): Map<string, number> {
    const revenueMap = new Map<string, number>();
    
    clientsData.forEach(client => {
      if (client.legal_name && typeof client.expected_monthly_revenue === 'number') {
        revenueMap.set(client.legal_name, client.expected_monthly_revenue);
      }
    });
    
    return revenueMap;
  }

  /**
   * Calculate client revenue based on totals and revenue map
   */
  static calculateClientRevenue(
    clientTotals: Map<string, number>,
    clientRevenueMap: Map<string, number>,
    monthCount: number
  ): Map<string, number> {
    const clientRevenue = new Map<string, number>();
    
    clientTotals.forEach((hours, clientName) => {
      const monthlyRevenue = clientRevenueMap.get(clientName) || 0;
      const totalRevenue = monthlyRevenue * monthCount;
      clientRevenue.set(clientName, totalRevenue);
    });
    
    return clientRevenue;
  }

  /**
   * Calculate client hourly rates
   */
  static calculateClientHourlyRates(
    clientTotals: Map<string, number>,
    clientRevenue: Map<string, number>
  ): Map<string, number> {
    const clientHourlyRates = new Map<string, number>();
    
    clientTotals.forEach((hours, clientName) => {
      const revenue = clientRevenue.get(clientName) || 0;
      const hourlyRate = hours > 0 ? revenue / hours : 0;
      clientHourlyRates.set(clientName, hourlyRate);
    });
    
    return clientHourlyRates;
  }

  /**
   * Calculate grand total revenue
   */
  static calculateGrandTotalRevenue(clientRevenue: Map<string, number>): number {
    return Array.from(clientRevenue.values()).reduce((sum, revenue) => sum + revenue, 0);
  }

  /**
   * Calculate weighted average rate
   */
  static calculateWeightedAverageRate(
    clientTotals: Map<string, number>,
    clientRevenue: Map<string, number>
  ): number {
    const totalHours = Array.from(clientTotals.values()).reduce((sum, hours) => sum + hours, 0);
    const totalRevenue = Array.from(clientRevenue.values()).reduce((sum, revenue) => sum + revenue, 0);
    
    return totalHours > 0 ? totalRevenue / totalHours : 0;
  }
}
