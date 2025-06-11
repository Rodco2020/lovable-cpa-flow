
import { describe, it, expect } from 'vitest';
import { ClientRevenueCalculator } from '@/services/forecasting/demand/matrixTransformer/clientRevenueCalculator';

describe('ClientRevenueCalculator', () => {
  const mockClientTotals = new Map([
    ['ABC Corp', 25],
    ['XYZ Ltd', 10],
    ['DEF Inc', 50]
  ]);

  const mockClientRevenueMap = new Map([
    ['ABC Corp', 5000],
    ['XYZ Ltd', 2000],
    ['DEF Inc', 8000]
  ]);

  describe('calculateClientRevenue', () => {
    it('should calculate total revenue correctly for 3 months', () => {
      const clientRevenue = ClientRevenueCalculator.calculateClientRevenue(
        mockClientTotals,
        mockClientRevenueMap,
        3
      );
      
      expect(clientRevenue.get('ABC Corp')).toBe(15000); // 5000 * 3
      expect(clientRevenue.get('XYZ Ltd')).toBe(6000);   // 2000 * 3
      expect(clientRevenue.get('DEF Inc')).toBe(24000);  // 8000 * 3
    });

    it('should handle clients with zero revenue', () => {
      const revenueMap = new Map([
        ['ABC Corp', 0],
        ['XYZ Ltd', 2000]
      ]);
      
      const clientRevenue = ClientRevenueCalculator.calculateClientRevenue(
        mockClientTotals,
        revenueMap,
        2
      );
      
      expect(clientRevenue.get('ABC Corp')).toBe(0);
      expect(clientRevenue.get('XYZ Ltd')).toBe(4000);
    });
  });

  describe('calculateClientHourlyRates', () => {
    it('should calculate hourly rates correctly', () => {
      const clientRevenue = new Map([
        ['ABC Corp', 15000],
        ['XYZ Ltd', 6000],
        ['DEF Inc', 24000]
      ]);
      
      const hourlyRates = ClientRevenueCalculator.calculateClientHourlyRates(
        mockClientTotals,
        clientRevenue
      );
      
      expect(hourlyRates.get('ABC Corp')).toBe(600); // 15000 / 25
      expect(hourlyRates.get('XYZ Ltd')).toBe(600);  // 6000 / 10
      expect(hourlyRates.get('DEF Inc')).toBe(480);  // 24000 / 50
    });

    it('should handle zero hours gracefully', () => {
      const clientTotalsWithZero = new Map([
        ['ABC Corp', 0],
        ['XYZ Ltd', 10]
      ]);
      
      const clientRevenue = new Map([
        ['ABC Corp', 5000],
        ['XYZ Ltd', 2000]
      ]);
      
      const hourlyRates = ClientRevenueCalculator.calculateClientHourlyRates(
        clientTotalsWithZero,
        clientRevenue
      );
      
      expect(hourlyRates.get('ABC Corp')).toBe(0);   // 0 hours = 0 rate
      expect(hourlyRates.get('XYZ Ltd')).toBe(200);  // 2000 / 10
    });
  });

  describe('buildClientRevenueMap', () => {
    it('should build revenue map from client data', () => {
      const clientsData = [
        { id: 'client-1', legal_name: 'ABC Corp', expected_monthly_revenue: 5000 },
        { id: 'client-2', legal_name: 'XYZ Ltd', expected_monthly_revenue: 2000 },
        { id: 'client-3', legal_name: 'DEF Inc', expected_monthly_revenue: 8000 }
      ];
      
      const revenueMap = ClientRevenueCalculator.buildClientRevenueMap(clientsData);
      
      expect(revenueMap.get('ABC Corp')).toBe(5000);
      expect(revenueMap.get('XYZ Ltd')).toBe(2000);
      expect(revenueMap.get('DEF Inc')).toBe(8000);
      expect(revenueMap.size).toBe(3);
    });
  });

  describe('calculateGrandTotalRevenue', () => {
    it('should calculate grand total revenue correctly', () => {
      const clientRevenue = new Map([
        ['ABC Corp', 15000],
        ['XYZ Ltd', 6000],
        ['DEF Inc', 24000]
      ]);
      
      const grandTotal = ClientRevenueCalculator.calculateGrandTotalRevenue(clientRevenue);
      
      expect(grandTotal).toBe(45000);
    });
  });

  describe('calculateWeightedAverageRate', () => {
    it('should calculate weighted average hourly rate correctly', () => {
      const clientRevenue = new Map([
        ['ABC Corp', 15000],
        ['XYZ Ltd', 6000],
        ['DEF Inc', 24000]
      ]);
      
      const weightedAverage = ClientRevenueCalculator.calculateWeightedAverageRate(
        mockClientTotals,
        clientRevenue
      );
      
      // Total revenue: 45000, Total hours: 85, Average: 529.41
      expect(weightedAverage).toBeCloseTo(529.41, 2);
    });

    it('should handle zero hours gracefully', () => {
      const emptyTotals = new Map();
      const emptyRevenue = new Map();
      
      const weightedAverage = ClientRevenueCalculator.calculateWeightedAverageRate(
        emptyTotals,
        emptyRevenue
      );
      
      expect(weightedAverage).toBe(0);
    });
  });
});
