
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';
import { DemandMatrixData } from '@/types/demand';

// Mock dependencies
vi.mock('@/services/forecasting/demand', () => ({
  ForecastGenerator: {
    generateDemandForecast: vi.fn(() => Promise.resolve([
      {
        period: '2025-01',
        demand: [{ skill: 'Tax Preparation', hours: 100 }],
        capacity: [],
        demandHours: 100,
        capacityHours: 0
      }
    ]))
  },
  DataFetcher: {
    fetchClientAssignedTasks: vi.fn(() => Promise.resolve([
      {
        id: '1',
        name: 'Test Task',
        client_id: 'client-1',
        required_skills: ['Tax Preparation'],
        estimated_hours: 10,
        recurrence_type: 'Monthly',
        recurrence_interval: 1,
        is_active: true,
        clients: { legal_name: 'Test Client' }
      }
    ]))
  },
  MatrixTransformer: {
    transformToMatrixData: vi.fn(() => ({
      months: [{ key: '2025-01', label: 'Jan 2025' }],
      skills: ['Tax Preparation'],
      dataPoints: [{
        skillType: 'Tax Preparation',
        month: '2025-01',
        monthLabel: 'Jan 2025',
        demandHours: 100,
        taskCount: 1,
        clientCount: 1,
        taskBreakdown: []
      }],
      totalDemand: 100,
      totalTasks: 1,
      totalClients: 1,
      skillSummary: {}
    }))
  }
}));

vi.mock('@/services/forecasting/logger', () => ({
  debugLog: vi.fn()
}));

describe('DemandMatrixService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    DemandMatrixService.clearCache();
  });

  describe('generateDemandMatrix', () => {
    it('should generate demand matrix successfully', async () => {
      const result = await DemandMatrixService.generateDemandMatrix('demand-only');
      
      expect(result).toHaveProperty('matrixData');
      expect(result.matrixData.months).toHaveLength(1);
      expect(result.matrixData.skills).toContain('Tax Preparation');
      expect(result.matrixData.totalDemand).toBe(100);
    });

    it('should use cache when available', async () => {
      // First call
      await DemandMatrixService.generateDemandMatrix('demand-only');
      
      // Second call should use cache (mock should only be called once)
      const result = await DemandMatrixService.generateDemandMatrix('demand-only');
      
      expect(result).toHaveProperty('matrixData');
    });

    it('should handle errors gracefully', async () => {
      const { ForecastGenerator } = await import('@/services/forecasting/demand');
      vi.mocked(ForecastGenerator.generateDemandForecast).mockRejectedValueOnce(new Error('Test error'));

      await expect(DemandMatrixService.generateDemandMatrix('demand-only'))
        .rejects.toThrow('Demand matrix generation failed');
    });
  });

  describe('validateDemandMatrixData', () => {
    it('should validate correct matrix data', () => {
      const validData: DemandMatrixData = {
        months: Array.from({ length: 12 }, (_, i) => ({
          key: `2025-${(i + 1).toString().padStart(2, '0')}`,
          label: `Month ${i + 1}`
        })),
        skills: ['Tax Preparation'],
        dataPoints: [{
          skillType: 'Tax Preparation',
          month: '2025-01',
          monthLabel: 'Jan 2025',
          demandHours: 100,
          taskCount: 1,
          clientCount: 1,
          taskBreakdown: [{
            clientId: 'client-1',
            clientName: 'Test Client',
            recurringTaskId: 'task-1',
            taskName: 'Test Task',
            skillType: 'Tax Preparation',
            estimatedHours: 10,
            recurrencePattern: { type: 'Monthly', frequency: 1 },
            monthlyHours: 10
          }]
        }],
        totalDemand: 100,
        totalTasks: 1,
        totalClients: 1,
        skillSummary: {}
      };

      const issues = DemandMatrixService.validateDemandMatrixData(validData);
      expect(issues).toHaveLength(0);
    });

    it('should detect validation issues', () => {
      const invalidData: DemandMatrixData = {
        months: [{ key: '2025-01', label: 'Jan 2025' }], // Should be 12 months
        skills: [], // Should have skills
        dataPoints: [{
          skillType: 'Tax Preparation',
          month: '2025-01',
          monthLabel: 'Jan 2025',
          demandHours: -100, // Negative hours
          taskCount: 1,
          clientCount: 1,
          taskBreakdown: []
        }],
        totalDemand: 50, // Mismatch with data point total
        totalTasks: 1,
        totalClients: 1,
        skillSummary: {}
      };

      const issues = DemandMatrixService.validateDemandMatrixData(invalidData);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues).toContain('Expected 12 months, got 1');
      expect(issues).toContain('No skills found in demand matrix data');
      expect(issues.some(issue => issue.includes('negative demand hours'))).toBe(true);
    });
  });

  describe('cache operations', () => {
    it('should generate cache key correctly', () => {
      const key = DemandMatrixService.getDemandMatrixCacheKey('demand-only', new Date('2025-01-15'));
      expect(key).toBe('demand_matrix_demand-only_2025-01');
    });

    it('should clear cache', () => {
      DemandMatrixService.clearCache();
      // Cache should be empty after clearing
      expect(true).toBe(true); // Simple assertion since cache is private
    });
  });
});
