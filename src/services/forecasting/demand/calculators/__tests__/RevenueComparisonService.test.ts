
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  RevenueComparisonService,
  RevenueComparisonServiceError,
  revenueComparisonService,
  type ClientRevenueData,
  type SkillDemandData
} from '../RevenueComparisonService';
import * as feeRateService from '@/services/skills/feeRateService';

// Mock the fee rate service
vi.mock('@/services/skills/feeRateService', () => ({
  getSkillFeeRatesMap: vi.fn(() => Promise.resolve(new Map([
    ['CPA', 250.00],
    ['Senior', 150.00],
    ['Junior', 100.00],
    ['Tax Specialist', 175.00]
  ]))),
  getDefaultFeeRates: vi.fn(() => ({
    'CPA': 250.00,
    'Senior': 150.00,
    'Junior': 100.00
  }))
}));

describe('RevenueComparisonService', () => {
  let service: RevenueComparisonService;
  let mockSkillDemandData: SkillDemandData[];
  let mockClientRevenueData: ClientRevenueData[];

  beforeEach(() => {
    service = RevenueComparisonService.getInstance();
    service.clearCache();
    
    mockSkillDemandData = [
      { skillName: 'CPA', demandHours: 20, clientCount: 2, taskCount: 5 },
      { skillName: 'Senior', demandHours: 40, clientCount: 3, taskCount: 8 },
      { skillName: 'Junior', demandHours: 60, clientCount: 4, taskCount: 12 }
    ];

    mockClientRevenueData = [
      { clientId: 'client1', clientName: 'Client A', expectedMonthlyRevenue: 5000 },
      { clientId: 'client2', clientName: 'Client B', expectedMonthlyRevenue: 7500 },
      { clientId: 'client3', clientName: 'Client C', expectedMonthlyRevenue: 2500 }
    ];

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = RevenueComparisonService.getInstance();
      const instance2 = RevenueComparisonService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should use the exported singleton', () => {
      expect(revenueComparisonService).toBeInstanceOf(RevenueComparisonService);
    });
  });

  describe('calculateRevenueComparison', () => {
    it('should calculate comprehensive revenue comparison correctly', async () => {
      const result = await service.calculateRevenueComparison(
        mockSkillDemandData,
        mockClientRevenueData
      );

      // Expected calculations:
      // CPA: 20 * 250 = 5000
      // Senior: 40 * 150 = 6000  
      // Junior: 60 * 100 = 6000
      // Total Suggested: 17000
      // Total Expected: 15000 (5000 + 7500 + 2500)
      // Difference: 15000 - 17000 = -2000

      expect(result.totalSuggestedRevenue).toBe(17000);
      expect(result.totalExpectedRevenue).toBe(15000);
      expect(result.expectedLessSuggested).toBe(-2000);
      expect(result.skillBreakdown).toHaveLength(3);
      expect(result.clientRevenueBreakdown).toHaveLength(3);
    });

    it('should handle empty skill demand data', async () => {
      const result = await service.calculateRevenueComparison([], mockClientRevenueData);

      expect(result.totalSuggestedRevenue).toBe(0);
      expect(result.totalExpectedRevenue).toBe(15000);
      expect(result.expectedLessSuggested).toBe(15000);
      expect(result.skillBreakdown).toHaveLength(0);
    });

    it('should handle empty client revenue data', async () => {
      const result = await service.calculateRevenueComparison(mockSkillDemandData, []);

      expect(result.totalSuggestedRevenue).toBe(17000);
      expect(result.totalExpectedRevenue).toBe(0);
      expect(result.expectedLessSuggested).toBe(-17000);
      expect(result.clientRevenueBreakdown).toHaveLength(0);
    });

    it('should include performance metrics', async () => {
      const result = await service.calculateRevenueComparison(
        mockSkillDemandData,
        mockClientRevenueData
      );

      expect(result.performanceMetrics).toBeDefined();
      expect(result.performanceMetrics.calculationTimeMs).toBeGreaterThan(0);
      expect(result.performanceMetrics.skillsProcessed).toBe(3);
      expect(result.performanceMetrics.clientsProcessed).toBe(3);
      expect(typeof result.performanceMetrics.cacheHits).toBe('number');
      expect(typeof result.performanceMetrics.errors).toBe('number');
    });

    it('should respect calculation options', async () => {
      const options = {
        useCache: false,
        batchSize: 1,
        includeDetailedBreakdown: false,
        performanceMonitoring: true
      };

      const result = await service.calculateRevenueComparison(
        mockSkillDemandData,
        mockClientRevenueData,
        options
      );

      expect(result.clientRevenueBreakdown).toHaveLength(0); // Should be empty when includeDetailedBreakdown is false
    });

    it('should handle calculation errors gracefully', async () => {
      // Mock the fee rate service to throw an error
      vi.mocked(feeRateService.getSkillFeeRatesMap).mockRejectedValueOnce(new Error('Service unavailable'));

      await expect(service.calculateRevenueComparison(mockSkillDemandData, mockClientRevenueData))
        .rejects.toThrow(RevenueComparisonServiceError);
    });
  });

  describe('Client Revenue Breakdown', () => {
    it('should calculate proportional client breakdown correctly', async () => {
      const result = await service.calculateRevenueComparison(
        mockSkillDemandData,
        mockClientRevenueData,
        { includeDetailedBreakdown: true }
      );

      const breakdown = result.clientRevenueBreakdown;
      expect(breakdown).toHaveLength(3);

      // Verify proportional allocation
      const totalExpected = 15000;
      const totalSuggested = 17000;

      // Client A: 5000/15000 = 1/3 of total suggested = 17000/3 ≈ 5666.67
      expect(breakdown[0].clientName).toBe('Client A');
      expect(breakdown[0].expectedRevenue).toBe(5000);
      expect(breakdown[0].suggestedRevenue).toBeCloseTo(5666.67, 2);
      expect(breakdown[0].difference).toBeCloseTo(-666.67, 2);

      // Client B: 7500/15000 = 1/2 of total suggested = 17000/2 = 8500
      expect(breakdown[1].clientName).toBe('Client B');
      expect(breakdown[1].expectedRevenue).toBe(7500);
      expect(breakdown[1].suggestedRevenue).toBe(8500);
      expect(breakdown[1].difference).toBe(-1000);

      // Client C: 2500/15000 = 1/6 of total suggested = 17000/6 ≈ 2833.33
      expect(breakdown[2].clientName).toBe('Client C');
      expect(breakdown[2].expectedRevenue).toBe(2500);
      expect(breakdown[2].suggestedRevenue).toBeCloseTo(2833.33, 2);
      expect(breakdown[2].difference).toBeCloseTo(-333.33, 2);
    });

    it('should handle zero total expected revenue', async () => {
      const zeroRevenueClients = [
        { clientId: 'client1', clientName: 'Client A', expectedMonthlyRevenue: 0 }
      ];

      const result = await service.calculateRevenueComparison(
        mockSkillDemandData,
        zeroRevenueClients,
        { includeDetailedBreakdown: true }
      );

      const breakdown = result.clientRevenueBreakdown;
      expect(breakdown).toHaveLength(1);
      expect(breakdown[0].suggestedRevenue).toBe(0);
      expect(breakdown[0].difference).toBe(0);
    });
  });

  describe('Batch Processing', () => {
    it('should process large datasets in batches', async () => {
      // Create large dataset
      const largeSkillData: SkillDemandData[] = Array.from({ length: 250 }, (_, i) => ({
        skillName: `Skill${i % 10}`,
        demandHours: Math.random() * 100,
        clientCount: Math.floor(Math.random() * 5) + 1,
        taskCount: Math.floor(Math.random() * 10) + 1
      }));

      const result = await service.calculateRevenueComparison(
        largeSkillData,
        mockClientRevenueData,
        { batchSize: 50 }
      );

      expect(result.skillBreakdown).toHaveLength(250);
      expect(result.performanceMetrics.skillsProcessed).toBe(250);
      expect(result.performanceMetrics.calculationTimeMs).toBeGreaterThan(0);
    });

    it('should yield control during large batch processing', async () => {
      const largeSkillData: SkillDemandData[] = Array.from({ length: 300 }, (_, i) => ({
        skillName: `Skill${i}`,
        demandHours: 10,
        clientCount: 1,
        taskCount: 1
      }));

      const startTime = performance.now();
      await service.calculateRevenueComparison(largeSkillData, [], { batchSize: 100 });
      const endTime = performance.now();

      // Should complete in reasonable time even with large dataset
      expect(endTime - startTime).toBeLessThan(1000); // Less than 1 second
    });
  });

  describe('Caching', () => {
    it('should cache results when enabled', async () => {
      await service.calculateRevenueComparison(
        mockSkillDemandData,
        mockClientRevenueData,
        { useCache: true }
      );

      // Check that cache has entries
      const cachedResult = service.getCachedResult('CPA', 20);
      expect(cachedResult).toBe(5000); // 20 * 250
    });

    it('should not cache when disabled', async () => {
      await service.calculateRevenueComparison(
        mockSkillDemandData,
        mockClientRevenueData,
        { useCache: false }
      );

      // Cache should be empty
      const cachedResult = service.getCachedResult('CPA', 20);
      expect(cachedResult).toBeUndefined();
    });

    it('should clear cache correctly', () => {
      // Add some cached data first
      service.calculateRevenueComparison(
        mockSkillDemandData,
        mockClientRevenueData,
        { useCache: true }
      );

      service.clearCache();
      
      const cachedResult = service.getCachedResult('CPA', 20);
      expect(cachedResult).toBeUndefined();
    });
  });

  describe('Performance Metrics', () => {
    it('should track performance metrics correctly', async () => {
      const initialMetrics = service.getPerformanceMetrics();
      
      await service.calculateRevenueComparison(
        mockSkillDemandData,
        mockClientRevenueData
      );

      const finalMetrics = service.getPerformanceMetrics();
      expect(finalMetrics.totalCalculations).toBe(initialMetrics.totalCalculations + 1);
      expect(finalMetrics.averageCalculationTime).toBeGreaterThan(0);
    });

    it('should track errors in performance metrics', async () => {
      const initialMetrics = service.getPerformanceMetrics();

      // Force an error
      vi.mocked(feeRateService.getSkillFeeRatesMap).mockRejectedValueOnce(new Error('Test error'));

      try {
        await service.calculateRevenueComparison(mockSkillDemandData, mockClientRevenueData);
      } catch (error) {
        // Expected to throw
      }

      const finalMetrics = service.getPerformanceMetrics();
      expect(finalMetrics.totalErrors).toBe(initialMetrics.totalErrors + 1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle skills with zero demand hours', async () => {
      const zeroHoursData = [
        { skillName: 'CPA', demandHours: 0, clientCount: 1, taskCount: 1 }
      ];

      const result = await service.calculateRevenueComparison(zeroHoursData, mockClientRevenueData);
      
      expect(result.totalSuggestedRevenue).toBe(0);
      expect(result.skillBreakdown[0].suggestedRevenue).toBe(0);
    });

    it('should handle very large revenue values', async () => {
      const largeRevenueData = [
        { clientId: 'client1', clientName: 'Large Client', expectedMonthlyRevenue: 1000000 }
      ];

      const result = await service.calculateRevenueComparison(
        mockSkillDemandData,
        largeRevenueData
      );

      expect(result.totalExpectedRevenue).toBe(1000000);
      expect(typeof result.expectedLessSuggested).toBe('number');
    });

    it('should handle fractional demand hours', async () => {
      const fractionalData = [
        { skillName: 'CPA', demandHours: 2.5, clientCount: 1, taskCount: 1 }
      ];

      const result = await service.calculateRevenueComparison(fractionalData, mockClientRevenueData);
      
      expect(result.totalSuggestedRevenue).toBe(625); // 2.5 * 250
    });
  });

  describe('Error Handling', () => {
    it('should provide meaningful error messages', async () => {
      vi.mocked(feeRateService.getSkillFeeRatesMap).mockRejectedValueOnce(new Error('Network error'));

      try {
        await service.calculateRevenueComparison(mockSkillDemandData, mockClientRevenueData);
      } catch (error) {
        expect(error).toBeInstanceOf(RevenueComparisonServiceError);
        expect(error.message).toContain('Failed to calculate revenue comparison');
        expect(error.code).toBe('COMPARISON_CALCULATION_ERROR');
      }
    });

    it('should handle partial calculation failures gracefully', async () => {
      // Create data with some invalid skills that will cause individual calculation errors
      const mixedData = [
        { skillName: 'CPA', demandHours: 10, clientCount: 1, taskCount: 1 },
        { skillName: '', demandHours: 20, clientCount: 1, taskCount: 1 }, // Invalid skill name
        { skillName: 'Junior', demandHours: 30, clientCount: 1, taskCount: 1 }
      ];

      const result = await service.calculateRevenueComparison(mixedData, mockClientRevenueData);

      // Should still complete with partial results
      expect(result.skillBreakdown).toHaveLength(3);
      expect(result.performanceMetrics.errors).toBeGreaterThan(0);
    });
  });
});
