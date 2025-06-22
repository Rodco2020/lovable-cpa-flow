
/**
 * Revenue Comparison Service
 * Handles comparison between expected and suggested revenue
 */

import { ClientRevenueData } from '@/types/demand';

export class RevenueComparisonService {
  /**
   * Compare expected vs suggested revenue for a client
   */
  static compareClientRevenue(clientData: ClientRevenueData): {
    variance: number;
    percentageVariance: number;
    recommendation: string;
  } {
    // FIXED: Use expectedRevenue instead of expectedMonthlyRevenue
    const expectedRevenue = clientData.expectedRevenue || 0;
    const suggestedRevenue = clientData.suggestedRevenue || 0;
    
    const variance = expectedRevenue - suggestedRevenue;
    const percentageVariance = expectedRevenue > 0 
      ? (variance / expectedRevenue) * 100 
      : 0;

    let recommendation = '';
    if (variance > 0) {
      recommendation = 'Consider increasing task scope or rates';
    } else if (variance < 0) {
      recommendation = 'Revenue expectations may be too conservative';
    } else {
      recommendation = 'Revenue expectations align with suggested rates';
    }

    return {
      variance,
      percentageVariance,
      recommendation
    };
  }

  /**
   * Generate revenue analysis report
   */
  static generateRevenueReport(clientsData: ClientRevenueData[]): {
    totalExpected: number;
    totalSuggested: number;
    totalVariance: number;
    recommendations: string[];
  } {
    let totalExpected = 0;
    let totalSuggested = 0;
    const recommendations: string[] = [];

    clientsData.forEach(client => {
      // FIXED: Use expectedRevenue consistently
      totalExpected += client.expectedRevenue || 0;
      totalSuggested += client.suggestedRevenue || 0;

      const comparison = this.compareClientRevenue(client);
      if (Math.abs(comparison.percentageVariance) > 10) {
        recommendations.push(`${client.clientName}: ${comparison.recommendation}`);
      }
    });

    return {
      totalExpected,
      totalSuggested,
      totalVariance: totalExpected - totalSuggested,
      recommendations
    };
  }

  /**
   * Calculate utilization impact on revenue
   */
  static calculateUtilizationImpact(client: ClientRevenueData): number {
    // FIXED: Use expectedRevenue
    return (client.expectedRevenue || 0) * (client.utilizationRate / 100);
  }
}
