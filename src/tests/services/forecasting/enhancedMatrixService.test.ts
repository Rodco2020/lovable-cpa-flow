
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EnhancedMatrixService } from '@/services/forecasting/enhanced/enhancedMatrixService';
import { EnhancedCacheManager } from '@/services/forecasting/enhanced/cacheManager';
import { SkillType } from '@/types/task';

// Mock dependencies
vi.mock('@/services/forecasting/matrixService', () => ({
  generateMatrixForecast: vi.fn(() => Promise.resolve({
    matrixData: {
      months: [{ key: '2025-01', label: 'Jan 2025' }],
      skills: ['Tax Preparation' as SkillType],
      dataPoints: [{
        skillType: 'Tax Preparation' as SkillType,
        month: '2025-01',
        monthLabel: 'Jan 2025',
        demandHours: 100,
        capacityHours: 120,
        gap: 20,
        utilizationPercent: 83.33
      }],
      totalDemand: 100,
      totalCapacity: 120,
      totalGap: 20
    }
  }))
}));

vi.mock('@/services/forecasting/analyticsService', () => ({
  AdvancedAnalyticsService: {
    analyzeTrends: vi.fn(() => []),
    generateRecommendations: vi.fn(() => []),
    generateAlerts: vi.fn(() => []),
    getDrillDownData: vi.fn(() => Promise.resolve({}))
  }
}));

describe('EnhancedMatrixService (Refactored)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    EnhancedCacheManager.clearCache();
  });

  describe('getEnhancedMatrixData', () => {
    it('should return matrix data with analytics', async () => {
      const result = await EnhancedMatrixService.getEnhancedMatrixData('virtual', {
        includeAnalytics: true,
        useCache: false
      });

      expect(result).toHaveProperty('matrixData');
      expect(result).toHaveProperty('trends');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('alerts');
      expect(result).toHaveProperty('performance');
      expect(result.performance.cacheHit).toBe(false);
    });

    it('should use cache when available', async () => {
      // First call to populate cache
      await EnhancedMatrixService.getEnhancedMatrixData('virtual', {
        includeAnalytics: true,
        useCache: true
      });

      // Second call should use cache
      const result = await EnhancedMatrixService.getEnhancedMatrixData('virtual', {
        includeAnalytics: true,
        useCache: true
      });

      expect(result.performance.cacheHit).toBe(true);
    });

    it('should call progress callback', async () => {
      const progressCallback = vi.fn();
      
      await EnhancedMatrixService.getEnhancedMatrixData('virtual', {
        progressCallback
      });

      expect(progressCallback).toHaveBeenCalledWith(10);
      expect(progressCallback).toHaveBeenCalledWith(30);
      expect(progressCallback).toHaveBeenCalledWith(60);
      expect(progressCallback).toHaveBeenCalledWith(90);
      expect(progressCallback).toHaveBeenCalledWith(100);
    });
  });

  describe('export functionality', () => {
    it('should generate CSV export', () => {
      const mockMatrixData = {
        months: [{ key: '2025-01', label: 'Jan 2025' }],
        skills: ['Tax Preparation' as SkillType],
        dataPoints: [{
          skillType: 'Tax Preparation' as SkillType,
          month: '2025-01',
          monthLabel: 'Jan 2025',
          demandHours: 100,
          capacityHours: 120,
          gap: 20,
          utilizationPercent: 83.33
        }],
        totalDemand: 100,
        totalCapacity: 120,
        totalGap: 20
      };

      const result = EnhancedMatrixService.generateCSVExport(
        mockMatrixData,
        ['Tax Preparation' as SkillType],
        { start: 0, end: 0 }
      );

      expect(typeof result).toBe('string');
      expect(result).toContain('Skill,Month,Demand (Hours)');
      expect(result).toContain('Tax Preparation');
    });

    it('should generate JSON export', () => {
      const mockMatrixData = {
        months: [{ key: '2025-01', label: 'Jan 2025' }],
        skills: ['Tax Preparation' as SkillType],
        dataPoints: [{
          skillType: 'Tax Preparation' as SkillType,
          month: '2025-01',
          monthLabel: 'Jan 2025',
          demandHours: 100,
          capacityHours: 120,
          gap: 20,
          utilizationPercent: 83.33
        }],
        totalDemand: 100,
        totalCapacity: 120,
        totalGap: 20
      };

      const result = EnhancedMatrixService.generateJSONExport(
        mockMatrixData,
        ['Tax Preparation' as SkillType],
        { start: 0, end: 0 }
      );

      expect(typeof result).toBe('string');
      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty('metadata');
      expect(parsed).toHaveProperty('data');
    });
  });

  describe('cache operations', () => {
    it('should clear cache', () => {
      EnhancedMatrixService.clearCache();
      const stats = EnhancedMatrixService.getCacheStats();
      expect(stats.size).toBe(0);
    });

    it('should provide cache statistics', () => {
      const stats = EnhancedMatrixService.getCacheStats();
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('maxSize');
      expect(stats).toHaveProperty('entries');
    });
  });
});
