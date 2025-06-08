
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';
import { DemandMatrixData } from '@/types/demand';

// Mock dependencies
vi.mock('@/services/forecasting/demandDataService', () => ({
  DemandDataService: {
    generateDemandForecast: vi.fn(() => Promise.resolve([])),
    fetchClientAssignedTasks: vi.fn(() => Promise.resolve([])),
    transformToMatrixData: vi.fn(() => ({
      months: [{ key: '2025-01', label: 'Jan 2025' }],
      skills: ['Tax Preparation'],
      dataPoints: [],
      totalDemand: 0,
      totalTasks: 0,
      totalClients: 0,
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
  });

  describe('validateDemandMatrixData', () => {
    it('should validate correct demand matrix data', () => {
      const validMatrixData: DemandMatrixData = {
        months: Array.from({ length: 12 }, (_, i) => ({
          key: `2025-${(i + 1).toString().padStart(2, '0')}`,
          label: `Month ${i + 1}`
        })),
        skills: ['Tax Preparation', 'Audit'],
        dataPoints: Array.from({ length: 24 }, (_, i) => ({
          skillType: i % 2 === 0 ? 'Tax Preparation' : 'Audit',
          month: `2025-${(Math.floor(i / 2) + 1).toString().padStart(2, '0')}`,
          monthLabel: `Month ${Math.floor(i / 2) + 1}`,
          demandHours: 100,
          taskCount: 5,
          clientCount: 3,
          taskBreakdown: []
        })),
        totalDemand: 2400,
        totalTasks: 10,
        totalClients: 5,
        skillSummary: {}
      };

      const issues = DemandMatrixService.validateDemandMatrixData(validMatrixData);
      expect(issues).toHaveLength(0);
    });

    it('should detect missing months', () => {
      const invalidMatrixData: DemandMatrixData = {
        months: [{ key: '2025-01', label: 'Jan 2025' }],
        skills: ['Tax Preparation'],
        dataPoints: [],
        totalDemand: 0,
        totalTasks: 0,
        totalClients: 0,
        skillSummary: {}
      };

      const issues = DemandMatrixService.validateDemandMatrixData(invalidMatrixData);
      expect(issues).toContain('Expected 12 months, got 1');
    });

    it('should detect missing skills', () => {
      const invalidMatrixData: DemandMatrixData = {
        months: Array.from({ length: 12 }, (_, i) => ({
          key: `2025-${(i + 1).toString().padStart(2, '0')}`,
          label: `Month ${i + 1}`
        })),
        skills: [],
        dataPoints: [],
        totalDemand: 0,
        totalTasks: 0,
        totalClients: 0,
        skillSummary: {}
      };

      const issues = DemandMatrixService.validateDemandMatrixData(invalidMatrixData);
      expect(issues).toContain('No skills found in demand matrix data');
    });

    it('should detect negative demand hours', () => {
      const invalidMatrixData: DemandMatrixData = {
        months: Array.from({ length: 12 }, (_, i) => ({
          key: `2025-${(i + 1).toString().padStart(2, '0')}`,
          label: `Month ${i + 1}`
        })),
        skills: ['Tax Preparation'],
        dataPoints: [{
          skillType: 'Tax Preparation',
          month: '2025-01',
          monthLabel: 'Jan 2025',
          demandHours: -100,
          taskCount: 5,
          clientCount: 3,
          taskBreakdown: []
        }],
        totalDemand: 0,
        totalTasks: 0,
        totalClients: 0,
        skillSummary: {}
      };

      const issues = DemandMatrixService.validateDemandMatrixData(invalidMatrixData);
      expect(issues).toContain('Found 1 data points with negative demand hours');
    });
  });

  describe('getDemandMatrixCacheKey', () => {
    it('should generate consistent cache keys', () => {
      const startDate = new Date('2025-01-01');
      const key = DemandMatrixService.getDemandMatrixCacheKey('demand-only', startDate);
      
      expect(key).toBe('demand_matrix_demand-only_2025-01');
    });
  });
});
