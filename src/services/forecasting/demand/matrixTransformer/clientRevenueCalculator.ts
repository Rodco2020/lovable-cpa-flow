
import { DemandDataPoint } from '@/types/demand';

/**
 * Enhanced Client Revenue Calculator
 * Now includes suggested revenue and expected less suggested calculations
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
   * NEW: Calculate suggested revenue per client based on skill rates and demand hours
   */
  static calculateClientSuggestedRevenue(
    dataPoints: DemandDataPoint[],
    skillFeeRates: Map<string, number>
  ): Map<string, number> {
    console.log('💡 [CLIENT SUGGESTED REVENUE] Calculating suggested revenue by client');
    
    const clientSuggestedRevenue = new Map<string, number>();
    
    // Group data points by client
    const clientDataMap = new Map<string, DemandDataPoint[]>();
    
    dataPoints.forEach(point => {
      if (point.taskBreakdown) {
        point.taskBreakdown.forEach(task => {
          if (!clientDataMap.has(task.clientName)) {
            clientDataMap.set(task.clientName, []);
          }
          clientDataMap.get(task.clientName)!.push({
            ...point,
            demandHours: task.monthlyHours // Use client-specific hours
          });
        });
      }
    });

    // Calculate suggested revenue for each client
    clientDataMap.forEach((points, clientName) => {
      let totalSuggestedRevenue = 0;
      
      points.forEach(point => {
        const feeRate = skillFeeRates.get(point.skillType) || 75.00; // Fallback rate
        const suggestedRevenue = point.demandHours * feeRate;
        totalSuggestedRevenue += suggestedRevenue;
      });
      
      clientSuggestedRevenue.set(clientName, totalSuggestedRevenue);
      console.log(`💡 [CLIENT SUGGESTED REVENUE] ${clientName}: $${totalSuggestedRevenue.toFixed(2)}`);
    });
    
    return clientSuggestedRevenue;
  }

  /**
   * NEW: Calculate expected less suggested for each client
   */
  static calculateClientExpectedLessSuggested(
    clientExpectedRevenue: Map<string, number>,
    clientSuggestedRevenue: Map<string, number>
  ): Map<string, number> {
    console.log('📊 [CLIENT EXPECTED LESS SUGGESTED] Calculating expected vs suggested differences');
    
    const clientExpectedLessSuggested = new Map<string, number>();
    
    // Get all unique client names from both maps
    const allClientNames = new Set([
      ...clientExpectedRevenue.keys(),
      ...clientSuggestedRevenue.keys()
    ]);
    
    allClientNames.forEach(clientName => {
      const expectedRevenue = clientExpectedRevenue.get(clientName) || 0;
      const suggestedRevenue = clientSuggestedRevenue.get(clientName) || 0;
      const difference = expectedRevenue - suggestedRevenue;
      
      clientExpectedLessS


ested.set(clientName, difference);
      
      const status = difference > 0 ? 'OVER' : difference < 0 ? 'UNDER' : 'MATCH';
      console.log(`📊 [CLIENT EXPECTED LESS SUGGESTED] ${clientName}: $${expectedRevenue} - $${suggestedRevenue.toFixed(2)} = $${difference.toFixed(2)} (${status})`);
    });
    
    return clientExpectedLessSuggested;
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

  /**
   * NEW: Generate comprehensive revenue analysis for all clients
   */
  static generateRevenueAnalysis(
    clientTotals: Map<string, number>,
    clientExpectedRevenue: Map<string, number>,
    clientSuggestedRevenue: Map<string, number>,
    clientHourlyRates: Map<string, number>
  ): {
    totalExpectedRevenue: number;
    totalSuggestedRevenue: number;
    totalExpectedLessSuggested: number;
    clientAnalysis: Array<{
      clientName: string;
      totalHours: number;
      expectedRevenue: number;
      suggestedRevenue: number;
      expectedLessSuggested: number;
      expectedHourlyRate: number;
      suggestedHourlyRate: number;
      profitabilityStatus: 'profitable' | 'break-even' | 'unprofitable';
    }>;
  } {
    const analysis = {
      totalExpectedRevenue: 0,
      totalSuggestedRevenue: 0,
      totalExpectedLessSuggested: 0,
      clientAnalysis: [] as any[]
    };

    // Calculate totals
    analysis.totalExpectedRevenue = Array.from(clientExpectedRevenue.values())
      .reduce((sum, revenue) => sum + revenue, 0);
    
    analysis.totalSuggestedRevenue = Array.from(clientSuggestedRevenue.values())
      .reduce((sum, revenue) => sum + revenue, 0);
    
    analysis.totalExpectedLessSuggested = analysis.totalExpectedRevenue - analysis.totalSuggestedRevenue;

    // Generate client-level analysis
    const allClients = new Set([
      ...clientTotals.keys(),
      ...clientExpectedRevenue.keys(),
      ...clientSuggestedRevenue.keys()
    ]);

    allClients.forEach(clientName => {
      const totalHours = clientTotals.get(clientName) || 0;
      const expectedRevenue = clientExpectedRevenue.get(clientName) || 0;
      const suggestedRevenue = clientSuggestedRevenue.get(clientName) || 0;
      const expectedLessSuggested = expectedRevenue - suggestedRevenue;
      const expectedHourlyRate = clientHourlyRates.get(clientName) || 0;
      const suggestedHourlyRate = totalHours > 0 ? suggestedRevenue / totalHours : 0;

      // Determine profitability status
      let profitabilityStatus: 'profitable' | 'break-even' | 'unprofitable';
      if (expectedLessSuggested > 0) {
        profitabilityStatus = 'profitable';
      } else if (expectedLessSuggested === 0) {
        profitabilityStatus = 'break-even';
      } else {
        profitabilityStatus = 'unprofitable';
      }

      analysis.clientAnalysis.push({
        clientName,
        totalHours,
        expectedRevenue,
        suggestedRevenue,
        expectedLessSuggested,
        expectedHourlyRate,
        suggestedHourlyRate,
        profitabilityStatus
      });
    });

    console.log('📈 [REVENUE ANALYSIS] Generated comprehensive revenue analysis:', {
      totalClients: analysis.clientAnalysis.length,
      totalExpectedRevenue: analysis.totalExpectedRevenue,
      totalSuggestedRevenue: analysis.totalSuggestedRevenue,
      totalExpectedLessSuggested: analysis.totalExpectedLessSuggested
    });

    return analysis;
  }
}
