
import { describe, it, expect } from 'vitest';
import { RevenueComparisonService } from '../RevenueComparisonService';
import { ClientRevenueData } from '@/types/demand';

describe('RevenueComparisonService', () => {
  const mockClientRevenueData: ClientRevenueData[] = [
    {
      expectedRevenue: 5000,
      suggestedRevenue: 4500,
      clientId: 'client-1',
      clientName: 'Client A',
      expectedMonthlyRevenue: 5000,
      totalHours: 50
    },
    {
      expectedRevenue: 3000,
      suggestedRevenue: 3200,
      clientId: 'client-2', 
      clientName: 'Client B',
      expectedMonthlyRevenue: 3000,
      totalHours: 30
    },
    {
      expectedRevenue: 7000,
      suggestedRevenue: 6800,
      clientId: 'client-3',
      clientName: 'Client C', 
      expectedMonthlyRevenue: 7000,
      totalHours: 70
    }
  ];

  describe('calculateTotalRevenueDifference', () => {
    it('should calculate total revenue difference correctly', () => {
      const result = RevenueComparisonService.calculateTotalRevenueDifference(mockClientRevenueData);
      
      // Expected: 15000, Suggested: 14500, Difference: -500
      expect(result.totalExpectedRevenue).toBe(15000);
      expect(result.totalSuggestedRevenue).toBe(14500);
      expect(result.totalDifference).toBe(-500);
    });

    it('should handle empty data', () => {
      const result = RevenueComparisonService.calculateTotalRevenueDifference([]);
      
      expect(result.totalExpectedRevenue).toBe(0);
      expect(result.totalSuggestedRevenue).toBe(0);
      expect(result.totalDifference).toBe(0);
    });
  });

  describe('identifySignificantDifferences', () => {
    it('should identify clients with significant revenue differences', () => {
      const result = RevenueComparisonService.identifySignificantDifferences(mockClientRevenueData, 0.1);
      
      expect(result).toHaveLength(2); // Client A and Client B have >10% difference
      expect(result.map(c => c.clientId)).toContain('client-1');
      expect(result.map(c => c.clientId)).toContain('client-2');
    });

    it('should return empty array when no significant differences', () => {
      const result = RevenueComparisonService.identifySignificantDifferences(mockClientRevenueData, 0.5);
      
      expect(result).toHaveLength(0);
    });
  });
});
