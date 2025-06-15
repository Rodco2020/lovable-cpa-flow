
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MatrixTransformerCore } from '../matrixTransformerCore';
import { DemandMatrixData } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';

// Mock dependencies
vi.mock('../../logger', () => ({
  debugLog: vi.fn()
}));

vi.mock('../../dataValidator', () => ({
  DataValidator: {
    validateRecurringTasks: vi.fn(() => Promise.resolve({
      validTasks: [],
      invalidTasks: [],
      resolvedTasks: []
    }))
  }
}));

vi.mock('../clientResolutionService', () => ({
  ClientResolutionService: {
    initializeClientCache: vi.fn(() => Promise.resolve()),
    getCacheStats: vi.fn(() => ({ clientsCount: 0 })),
    resolveClientIds: vi.fn(() => Promise.resolve(new Map([['client1', 'Test Client']])))
  }
}));

vi.mock('../dataFetcher', () => ({
  DataFetcher: {
    fetchClientsWithRevenue: vi.fn(() => Promise.resolve([
      { id: 'client1', legal_name: 'Test Client', expected_monthly_revenue: 5000 }
    ]))
  }
}));

vi.mock('@/services/skills/feeRateService', () => ({
  getSkillFeeRatesMap: vi.fn(() => Promise.resolve(new Map([
    ['CPA', 250.00],
    ['Senior', 150.00],
    ['Junior', 100.00]
  ])))
}));

describe('MatrixTransformerCore Integration Tests', () => {
  let mockForecastData: ForecastData[];
  let mockTasks: RecurringTaskDB[];

  beforeEach(() => {
    mockForecastData = [
      {
        period: '2024-01',
        demand: [
          { skill: 'CPA', hours: 20 },
          { skill: 'Senior', hours: 40 },
          { skill: 'Junior', hours: 60 }
        ],
        capacity: [
          { skill: 'CPA', hours: 25 },
          { skill: 'Senior', hours: 45 },
          { skill: 'Junior', hours: 65 }
        ]
      }
    ];

    mockTasks = [
      {
        id: 'task1',
        client_id: 'client1',
        template_id: 'template1',
        name: 'Test Task',
        description: 'Test Description',
        estimated_hours: 10,
        required_skills: ['CPA'],
        priority: 'High',
        category: 'Tax',
        recurrence_type: 'Monthly',
        recurrence_interval: 1,
        is_active: true,
        status: 'Unscheduled',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Enhanced Matrix Transformation', () => {
    it('should transform data with revenue calculations', async () => {
      const result = await MatrixTransformerCore.transformToMatrixData(
        mockForecastData,
        mockTasks
      );

      expect(result).toBeDefined();
      expect(result.months).toBeDefined();
      expect(result.skills).toBeDefined();
      expect(result.dataPoints).toBeDefined();
      
      // Check for new revenue fields
      expect(result.clientSuggestedRevenue).toBeDefined();
      expect(result.clientExpectedLessSuggested).toBeDefined();
      expect(result.revenueTotals).toBeDefined();
      
      // Verify revenue totals structure
      expect(result.revenueTotals?.totalSuggestedRevenue).toBeDefined();
      expect(result.revenueTotals?.totalExpectedRevenue).toBeDefined();
      expect(result.revenueTotals?.totalExpectedLessSuggested).toBeDefined();
    });

    it('should include revenue calculations in data points', async () => {
      const result = await MatrixTransformerCore.transformToMatrixData(
        mockForecastData,
        mockTasks
      );

      const dataPointsWithRevenue = result.dataPoints.filter(dp => 
        dp.suggestedRevenue !== undefined && dp.expectedLessSuggested !== undefined
      );

      expect(dataPointsWithRevenue.length).toBeGreaterThan(0);
      
      // Check that revenue values are numbers
      dataPointsWithRevenue.forEach(dp => {
        expect(typeof dp.suggestedRevenue).toBe('number');
        expect(typeof dp.expectedLessSuggested).toBe('number');
      });
    });

    it('should enhance skill summary with revenue information', async () => {
      const result = await MatrixTransformerCore.transformToMatrixData(
        mockForecastData,
        mockTasks
      );

      const skillSummaryEntries = Object.entries(result.skillSummary);
      expect(skillSummaryEntries.length).toBeGreaterThan(0);

      skillSummaryEntries.forEach(([skillName, skillData]) => {
        expect(skillData.totalHours).toBeDefined();
        expect(skillData.taskCount).toBeDefined();
        expect(skillData.clientCount).toBeDefined();
        
        // Check for new revenue fields
        expect(skillData.totalSuggestedRevenue).toBeDefined();
        expect(skillData.totalExpectedLessSuggested).toBeDefined();
        expect(skillData.averageFeeRate).toBeDefined();
      });
    });

    it('should calculate client-level revenue metrics', async () => {
      const result = await MatrixTransformerCore.transformToMatrixData(
        mockForecastData,
        mockTasks
      );

      // Should have client revenue maps
      expect(result.clientSuggestedRevenue).toBeInstanceOf(Map);
      expect(result.clientExpectedLessSuggested).toBeInstanceOf(Map);
      
      // Maps should contain data if clients exist
      if (result.clientTotals && result.clientTotals.size > 0) {
        expect(result.clientSuggestedRevenue!.size).toBeGreaterThan(0);
        expect(result.clientExpectedLessSuggested!.size).toBeGreaterThan(0);
      }
    });

    it('should maintain performance under 2 seconds', async () => {
      const startTime = performance.now();
      
      await MatrixTransformerCore.transformToMatrixData(
        mockForecastData,
        mockTasks
      );
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(2000); // Less than 2 seconds
    });

    it('should handle large datasets efficiently', async () => {
      // Create larger dataset with correct structure
      const largeForecastData = Array.from({ length: 12 }, (_, i) => ({
        period: `2024-${String(i + 1).padStart(2, '0')}`,
        demand: [
          { skill: 'CPA', hours: Math.random() * 50 },
          { skill: 'Senior', hours: Math.random() * 100 },
          { skill: 'Junior', hours: Math.random() * 150 }
        ],
        capacity: [
          { skill: 'CPA', hours: Math.random() * 60 },
          { skill: 'Senior', hours: Math.random() * 110 },
          { skill: 'Junior', hours: Math.random() * 160 }
        ]
      }));

      const largeTasks = Array.from({ length: 50 }, (_, i) => ({
        id: `task${i + 1}`,
        client_id: `client${(i % 10) + 1}`,
        template_id: `template${i + 1}`,
        name: `Test Task ${i + 1}`,
        description: `Test Description ${i + 1}`,
        estimated_hours: Math.random() * 20,
        required_skills: [['CPA', 'Senior', 'Junior'][i % 3]],
        priority: ['High', 'Medium', 'Low'][i % 3],
        category: 'Tax',
        recurrence_type: 'Monthly',
        recurrence_interval: 1,
        is_active: true,
        status: 'Unscheduled',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const startTime = performance.now();
      
      const result = await MatrixTransformerCore.transformToMatrixData(
        largeForecastData,
        largeTasks
      );
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result).toBeDefined();
      expect(result.dataPoints.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(2000); // Should still be under 2 seconds
    });

    it('should handle errors gracefully', async () => {
      // Test with invalid data
      const invalidForecastData = null as any;
      const invalidTasks = undefined as any;

      const result = await MatrixTransformerCore.transformToMatrixData(
        invalidForecastData,
        invalidTasks
      );

      // Should return a valid empty structure instead of throwing
      expect(result).toBeDefined();
      expect(result.months).toEqual([]);
      expect(result.skills).toEqual([]);
      expect(result.dataPoints).toEqual([]);
      expect(result.totalDemand).toBe(0);
      expect(result.totalTasks).toBe(0);
      expect(result.totalClients).toBe(0);
      
      // Should have revenue structure even when empty
      expect(result.clientSuggestedRevenue).toBeInstanceOf(Map);
      expect(result.clientExpectedLessSuggested).toBeInstanceOf(Map);
      expect(result.revenueTotals).toBeDefined();
    });

    it('should validate enhanced data structure', async () => {
      const result = await MatrixTransformerCore.transformToMatrixData(
        mockForecastData,
        mockTasks
      );

      // Check that all required fields are present
      expect(result.months).toBeDefined();
      expect(result.skills).toBeDefined();
      expect(result.dataPoints).toBeDefined();
      expect(result.skillSummary).toBeDefined();
      expect(result.clientTotals).toBeDefined();
      expect(result.clientRevenue).toBeDefined();
      expect(result.clientHourlyRates).toBeDefined();
      
      // Check new revenue fields
      expect(result.clientSuggestedRevenue).toBeDefined();
      expect(result.clientExpectedLessSuggested).toBeDefined();
      expect(result.revenueTotals).toBeDefined();

      // Validate data types
      expect(typeof result.totalDemand).toBe('number');
      expect(typeof result.totalTasks).toBe('number');
      expect(typeof result.totalClients).toBe('number');
      expect(Array.isArray(result.months)).toBe(true);
      expect(Array.isArray(result.skills)).toBe(true);
      expect(Array.isArray(result.dataPoints)).toBe(true);
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain all existing functionality', async () => {
      const result = await MatrixTransformerCore.transformToMatrixData(
        mockForecastData,
        mockTasks
      );

      // All original fields should still be present and functional
      expect(result.months).toBeDefined();
      expect(result.skills).toBeDefined();
      expect(result.dataPoints).toBeDefined();
      expect(result.totalDemand).toBeDefined();
      expect(result.totalTasks).toBeDefined();
      expect(result.totalClients).toBeDefined();
      expect(result.skillSummary).toBeDefined();
      expect(result.clientTotals).toBeDefined();
      expect(result.clientRevenue).toBeDefined();
      expect(result.clientHourlyRates).toBeDefined();

      // Original data point structure should be preserved
      result.dataPoints.forEach(dp => {
        expect(dp.skillType).toBeDefined();
        expect(dp.month).toBeDefined();
        expect(dp.monthLabel).toBeDefined();
        expect(dp.demandHours).toBeDefined();
        expect(dp.taskCount).toBeDefined();
        expect(dp.clientCount).toBeDefined();
      });
    });

    it('should work without revenue data', async () => {
      // Mock services to return empty data
      vi.mocked(require('../dataFetcher').DataFetcher.fetchClientsWithRevenue)
        .mockResolvedValueOnce([]);
      
      vi.mocked(require('@/services/skills/feeRateService').getSkillFeeRatesMap)
        .mockResolvedValueOnce(new Map());

      const result = await MatrixTransformerCore.transformToMatrixData(
        mockForecastData,
        mockTasks
      );

      // Should still generate a valid matrix
      expect(result).toBeDefined();
      expect(result.dataPoints).toBeDefined();
      
      // Revenue fields should exist but may be empty/zero
      expect(result.clientSuggestedRevenue).toBeDefined();
      expect(result.clientExpectedLessSuggested).toBeDefined();
      expect(result.revenueTotals).toBeDefined();
    });
  });
});
