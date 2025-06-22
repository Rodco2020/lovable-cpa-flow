
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          in: vi.fn(() => ({
            data: [],
            error: null
          }))
        }))
      }))
    }))
  }
}));

// Mock logger
vi.mock('@/services/forecasting/logger', () => ({
  debugLog: vi.fn()
}));

// Mock DemandDataService
vi.mock('@/services/forecasting/demandDataService', () => ({
  DemandDataService: {
    generateDemandForecastWithMatrix: vi.fn().mockResolvedValue({
      demandMatrix: {
        months: [],
        skills: [],
        dataPoints: [],
        totalDemand: 0,
        totalTasks: 0,
        totalClients: 0,
        skillSummary: {}
      }
    })
  }
}));

// Mock DemandPerformanceOptimizer
vi.mock('@/services/forecasting/demand/performanceOptimizer', () => ({
  DemandPerformanceOptimizer: {
    optimizeFiltering: vi.fn().mockImplementation((data) => data)
  }
}));

describe('DemandMatrixService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateDemandMatrix', () => {
    it('should generate matrix data successfully', async () => {
      const result = await DemandMatrixService.generateDemandMatrix('demand-only');
      expect(result).toHaveProperty('matrixData');
      expect(result.matrixData).toHaveProperty('months');
      expect(result.matrixData).toHaveProperty('skills');
    });
  });

  describe('getDemandMatrixCacheKey', () => {
    it('should generate correct cache key', () => {
      const key = DemandMatrixService.getDemandMatrixCacheKey('demand-only');
      expect(key).toBe('demandMatrix-demand-only');
    });
  });

  describe('validateDemandMatrixData', () => {
    it('should validate matrix data correctly', () => {
      const validData = {
        months: [{ key: '2025-01', label: 'January 2025' }],
        skills: ['Tax Preparation'],
        dataPoints: [],
        totalDemand: 0,
        totalTasks: 0,
        totalClients: 0,
        skillSummary: {}
      };

      const errors = DemandMatrixService.validateDemandMatrixData(validData);
      expect(errors).toHaveLength(0);
    });

    it('should return errors for invalid data', () => {
      const invalidData = {
        months: [],
        skills: [],
        dataPoints: [],
        totalDemand: 0,
        totalTasks: 0,
        totalClients: 0,
        skillSummary: {}
      };

      const errors = DemandMatrixService.validateDemandMatrixData(invalidData);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
