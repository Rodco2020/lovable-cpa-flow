
import { DemandDataPoint } from '@/types/demand';

/**
 * Client Revenue Calculator
 * Calculates revenue metrics for clients in the demand matrix
 */
export class ClientRevenueCalculator {
  /**
   * Calculate total expected revenue per client based on monthly revenue and time period
   */
  static calculateClientRevenue(
    clientTotals: Map<string, number>,
    clientRevenueMap: Map<string, number>,
    monthCount: number
  ): Map<string, number> {
    console.log(`💰 [CLIENT REVENUE] Calculating revenue for ${clientTotals.size} clients over ${monthCount} months`);
    
    const clientRevenue = new Map<string, number>();
    
    clientTotals.forEach((totalHours, clientName) => {
      const monthlyRevenue = clientRevenueMap.get(clientName) || 0;
      const totalExpectedRevenue = monthlyRevenue * monthCount;
      
      clientRevenue.set(clientName, totalExpectedRevenue);
      
      console.log(`💰 [CLIENT REVENUE] ${clientName}: $${monthlyRevenue}/month × ${monthCount} months = $${totalExpectedRevenue}`);
    });
    
    return clientRevenue;
  }

  /**
   * Calculate expected hourly rate per client (Total Revenue / Total Hours)
   */
  static calculateClientHourlyRates(
    clientTotals: Map<string, number>,
    clientRevenue: Map<string, number>
  ): Map<string, number> {
    console.log(`⏱️ [CLIENT HOURLY RATES] Calculating hourly rates for ${clientTotals.size} clients`);
    
    const clientHourlyRates = new Map<string, number>();
    
    clientTotals.forEach((totalHours, clientName) => {
      const totalRevenue = clientRevenue.get(clientName) || 0;
      
      if (totalHours > 0) {
        const hourlyRate = totalRevenue / totalHours;
        clientHourlyRates.set(clientName, hourlyRate);
        
        console.log(`⏱️ [CLIENT HOURLY RATES] ${clientName}: $${totalRevenue} ÷ ${totalHours}h = $${hourlyRate.toFixed(2)}/hour`);
      } else {
        clientHourlyRates.set(clientName, 0);
        console.log(`⏱️ [CLIENT HOURLY RATES] ${clientName}: No hours recorded, rate = $0/hour`);
      }
    });
    
    return clientHourlyRates;
  }

  /**
   * Get client revenue lookup map from client IDs to monthly revenue
   */
  static buildClientRevenueMap(clientsData: Array<{ id: string; legal_name: string; expected_monthly_revenue: number }>): Map<string, number> {
    const revenueMap = new Map<string, number>();
    
    clientsData.forEach(client => {
      if (client.legal_name && typeof client.expected_monthly_revenue === 'number') {
        revenueMap.set(client.legal_name, client.expected_monthly_revenue);
      }
    });
    
    console.log(`📊 [CLIENT REVENUE MAP] Built revenue map for ${revenueMap.size} clients`);
    return revenueMap;
  }

  /**
   * Calculate grand total revenue across all clients
   */
  static calculateGrandTotalRevenue(clientRevenue: Map<string, number>): number {
    return Array.from(clientRevenue.values()).reduce((sum, revenue) => sum + revenue, 0);
  }

  /**
   * Calculate weighted average hourly rate across all clients
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
