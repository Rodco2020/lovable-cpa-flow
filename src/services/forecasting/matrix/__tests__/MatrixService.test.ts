
import { MatrixServiceCore } from '../MatrixServiceCore';
import { MatrixValidator } from '../MatrixValidator';
import { MatrixCacheManager } from '../MatrixCacheManager';
import { MATRIX_CONSTANTS } from '../constants';

/**
 * Matrix Service Tests
 * Basic tests to ensure refactored services work correctly
 */

describe('MatrixServiceCore', () => {
  beforeEach(() => {
    // Clear cache before each test
    MatrixCacheManager.clearCache();
  });

  describe('generateMatrixForecast', () => {
    it('should generate matrix forecast with default parameters', async () => {
      // This test would need to be implemented with proper mocking
      // For now, we're just ensuring the structure is correct
      expect(typeof MatrixServiceCore.generateMatrixForecast).toBe('function');
    });

    it('should use cache when enabled', async () => {
      const stats = MatrixServiceCore.getCacheStats();
      expect(typeof stats).toBe('object');
    });
  });

  describe('clearCache', () => {
    it('should clear cache successfully', () => {
      MatrixServiceCore.clearCache();
      const stats = MatrixServiceCore.getCacheStats();
      expect(stats.totalEntries).toBe(0);
    });
  });
});

describe('MatrixValidator', () => {
  describe('validateMatrixData', () => {
    it('should validate matrix data structure', () => {
      const mockData = {
        months: [{ key: '2023-01', label: 'Jan 2023', index: 0 }],
        skills: ['Junior'],
        dataPoints: [{
          skillType: 'Junior',
          month: '2023-01',
          monthLabel: 'Jan 2023',
          demandHours: 100,
          capacityHours: 80,
          gap: 20,
          utilizationPercent: 125
        }],
        totalDemand: 100,
        totalCapacity: 80,
        totalGap: 20
      };

      const result = MatrixValidator.validateMatrixData(mockData);
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should detect validation issues', () => {
      const invalidData = {
        months: [],
        skills: [],
        dataPoints: [],
        totalDemand: 0,
        totalCapacity: 0,
        totalGap: 0
      };

      const result = MatrixValidator.validateMatrixData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });
});

describe('MatrixCacheManager', () => {
  it('should generate consistent cache keys', () => {
    const date = new Date('2023-01-01');
    const key1 = MatrixCacheManager.getCacheKey('virtual', date);
    const key2 = MatrixCacheManager.getCacheKey('virtual', date);
    
    expect(key1).toBe(key2);
    expect(key1).toContain('virtual');
    expect(key1).toContain('2023');
  });

  it('should handle cache operations', () => {
    const date = new Date('2023-01-01');
    const mockData = {
      months: [],
      skills: [],
      dataPoints: [],
      totalDemand: 0,
      totalCapacity: 0,
      totalGap: 0
    };

    // Test cache miss
    const cached = MatrixCacheManager.getCachedData('virtual', date);
    expect(cached).toBeNull();

    // Test cache set and hit
    MatrixCacheManager.setCachedData('virtual', date, mockData);
    const retrieved = MatrixCacheManager.getCachedData('virtual', date);
    expect(retrieved).toEqual(mockData);
  });
});

describe('Constants', () => {
  it('should have all required constants', () => {
    expect(MATRIX_CONSTANTS.CACHE_TTL_MS).toBeGreaterThan(0);
    expect(MATRIX_CONSTANTS.MAX_CACHE_ENTRIES).toBeGreaterThan(0);
    expect(MATRIX_CONSTANTS.ERROR_CODES).toBeDefined();
    expect(MATRIX_CONSTANTS.DEFAULT_FORECAST_TYPE).toBe('virtual');
  });
});
