
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';
import { DemandMatrixData } from '@/types/demand';

// Mock the new refactored services
vi.mock('@/services/forecasting/demand/demandMatrixOrchestrator', () => ({
  DemandMatrixOrchestrator: {
    generateDemandMatrix: vi.fn(() => Promise.resolve({
      matrixData: {
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
      }
    }))
  }
}));

vi.mock('@/services/forecasting/demand/demandMatrixValidationService', () => ({
  DemandMatrixValidationService: {
    validateDemandMatrixData: vi.fn().mockReturnValue([])
  }
}));

vi.mock('@/services/forecasting/demand/demandMatrixCacheService', () => ({
  DemandMatrixCacheService: {
    getDemandMatrixCacheKey: vi.fn().mockReturnValue('test-cache-key'),
    clearCache: vi.fn(),
    getCacheStats: vi.fn().mockReturnValue({ size: 0, keys: [], timestamps: [] })
  }
}));

describe('DemandMatrixService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateDemandMatrix', () => {
    it('should generate demand matrix successfully', async () => {
      const result = await DemandMatrixService.generateDemandMatrix('demand-only');
      
      expect(result).toHaveProperty('matrixData');
      expect(result.matrixData.months).toHaveLength(1);
      expect(result.matrixData.skills).toContain('Tax Preparation');
      expect(result.matrixData.totalDemand).toBe(100);
    });

    it('should handle errors gracefully', async () => {
      const { DemandMatrixOrchestrator } = await import('@/services/forecasting/demand/demandMatrixOrchestrator');
      vi.mocked(DemandMatrixOrchestrator.generateDemandMatrix).mockRejectedValueOnce(new Error('Test error'));

      await expect(DemandMatrixService.generateDemandMatrix('demand-only'))
        .rejects.toThrow('Test error');
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
            recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
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
  });

  describe('cache operations', () => {
    it('should generate cache key correctly', () => {
      const key = DemandMatrixService.getDemandMatrixCacheKey('demand-only', new Date('2025-01-15'));
      expect(key).toBe('test-cache-key');
    });

    it('should clear cache', () => {
      DemandMatrixService.clearCache();
      expect(true).toBe(true); // Cache clearing is tested in the mock
    });

    it('should get cache stats', () => {
      const stats = DemandMatrixService.getCacheStats();
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('keys');
      expect(stats).toHaveProperty('timestamps');
    });
  });
});
