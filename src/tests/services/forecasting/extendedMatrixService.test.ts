
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExtendedMatrixService } from '@/services/forecasting/extendedMatrixService';

// Mock dependencies
vi.mock('@/services/forecasting/matrixService', () => ({
  generateMatrixForecast: vi.fn(() => Promise.resolve({
    matrixData: {
      months: [{ key: '2025-01', label: 'Jan 2025' }],
      skills: ['Tax Preparation'],
      dataPoints: [],
      totalDemand: 0,
      totalCapacity: 0,
      totalGap: 0
    }
  })),
  validateMatrixData: vi.fn(() => [])
}));

vi.mock('@/services/forecasting/demandMatrixService', () => ({
  DemandMatrixService: {
    generateDemandMatrix: vi.fn(() => Promise.resolve({
      matrixData: {
        months: [{ key: '2025-01', label: 'Jan 2025' }],
        skills: ['Tax Preparation'],
        dataPoints: [],
        totalDemand: 0,
        totalTasks: 0,
        totalClients: 0,
        skillSummary: {}
      }
    })),
    validateDemandMatrixData: vi.fn(() => []),
    getDemandMatrixCacheKey: vi.fn(() => 'demand_cache_key')
  }
}));

vi.mock('@/services/forecasting/logger', () => ({
  debugLog: vi.fn()
}));

describe('ExtendedMatrixService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateUnifiedMatrix', () => {
    it('should generate capacity matrix when type is capacity', async () => {
      const result = await ExtendedMatrixService.generateUnifiedMatrix('capacity', 'virtual');

      expect(result.matrixType).toBe('capacity');
      expect(result.matrixData).toBeDefined();
      expect(result.demandMatrixData).toBeUndefined();
    });

    it('should generate demand matrix when type is demand', async () => {
      const result = await ExtendedMatrixService.generateUnifiedMatrix('demand', 'virtual');

      expect(result.matrixType).toBe('demand');
      expect(result.demandMatrixData).toBeDefined();
      expect(result.matrixData).toBeUndefined();
    });

    it('should handle errors gracefully', async () => {
      const { DemandMatrixService } = await import('@/services/forecasting/demandMatrixService');
      vi.mocked(DemandMatrixService.generateDemandMatrix).mockRejectedValue(new Error('Test error'));

      await expect(
        ExtendedMatrixService.generateUnifiedMatrix('demand', 'virtual')
      ).rejects.toThrow('demand matrix generation failed: Test error');
    });
  });

  describe('validateMatrixData', () => {
    it('should use capacity validation for capacity matrix', () => {
      const mockMatrixData = {
        months: [],
        skills: [],
        dataPoints: [],
        totalDemand: 0,
        totalCapacity: 0,
        totalGap: 0
      };

      ExtendedMatrixService.validateMatrixData(mockMatrixData, 'capacity');

      const { validateMatrixData } = require('@/services/forecasting/matrixService');
      expect(validateMatrixData).toHaveBeenCalledWith(mockMatrixData);
    });

    it('should use demand validation for demand matrix', () => {
      const mockDemandMatrixData = {
        months: [],
        skills: [],
        dataPoints: [],
        totalDemand: 0,
        totalTasks: 0,
        totalClients: 0,
        skillSummary: {}
      };

      ExtendedMatrixService.validateMatrixData(mockDemandMatrixData, 'demand');

      const { DemandMatrixService } = require('@/services/forecasting/demandMatrixService');
      expect(DemandMatrixService.validateDemandMatrixData).toHaveBeenCalledWith(mockDemandMatrixData);
    });
  });

  describe('getCacheKey', () => {
    it('should generate appropriate cache key for capacity matrix', () => {
      const startDate = new Date('2025-01-01');
      
      ExtendedMatrixService.getCacheKey('capacity', 'virtual', startDate);

      const { getMatrixCacheKey } = require('@/services/forecasting/matrixService');
      expect(getMatrixCacheKey).toHaveBeenCalledWith('virtual', startDate);
    });

    it('should generate appropriate cache key for demand matrix', () => {
      const startDate = new Date('2025-01-01');
      
      ExtendedMatrixService.getCacheKey('demand', 'demand-only', startDate);

      const { DemandMatrixService } = require('@/services/forecasting/demandMatrixService');
      expect(DemandMatrixService.getDemandMatrixCacheKey).toHaveBeenCalledWith('demand-only', startDate);
    });
  });
});
