
import { ClientRevenueData } from '@/types/demand';

export interface RevenueDifferenceResult {
  totalExpectedRevenue: number;
  totalSuggestedRevenue: number;
  totalDifference: number;
}

/**
 * Revenue Comparison Service
 * Handles comparison and analysis of expected vs suggested revenue
 */
export class RevenueComparisonService {
  
  /**
   * Calculate total revenue difference across all clients
   */
  static calculateTotalRevenueDifference(clientRevenueData: ClientRevenueData[]): RevenueDifferenceResult {
    const totalExpectedRevenue = clientRevenueData.reduce((sum, client) => sum + client.expectedRevenue, 0);
    const totalSuggestedRevenue = clientRevenueData.reduce((sum, client) => sum + client.suggestedRevenue, 0);
    const totalDifference = totalSuggestedRevenue - totalExpectedRevenue;
    
    return {
      totalExpectedRevenue,
      totalSuggestedRevenue,
      totalDifference
    };
  }
  
  /**
   * Identify clients with significant revenue differences
   */
  static identifySignificantDifferences(
    clientRevenueData: ClientRevenueData[],
    threshold: number = 0.1
  ): ClientRevenueData[] {
    return clientRevenueData.filter(client => {
      if (client.expectedRevenue === 0) return false;
      
      const percentageDifference = Math.abs(client.suggestedRevenue - client.expectedRevenue) / client.expectedRevenue;
      return percentageDifference > threshold;
    });
  }
  
  /**
   * Calculate revenue variance statistics
   */
  static calculateRevenueVariance(clientRevenueData: ClientRevenueData[]): {
    averageDifference: number;
    medianDifference: number;
    standardDeviation: number;
    varianceRange: { min: number; max: number };
  } {
    const differences = clientRevenueData.map(client => client.suggestedRevenue - client.expectedRevenue);
    
    const averageDifference = differences.reduce((sum, diff) => sum + diff, 0) / differences.length;
    
    const sortedDifferences = [...differences].sort((a, b) => a - b);
    const medianDifference = sortedDifferences.length % 2 === 0
      ? (sortedDifferences[sortedDifferences.length / 2 - 1] + sortedDifferences[sortedDifferences.length / 2]) / 2
      : sortedDifferences[Math.floor(sortedDifferences.length / 2)];
    
    const variance = differences.reduce((sum, diff) => sum + Math.pow(diff - averageDifference, 2), 0) / differences.length;
    const standardDeviation = Math.sqrt(variance);
    
    const varianceRange = {
      min: Math.min(...differences),
      max: Math.max(...differences)
    };
    
    return {
      averageDifference,
      medianDifference,
      standardDeviation,
      varianceRange
    };
  }
}
