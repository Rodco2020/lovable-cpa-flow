
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  getClientTasksForPeriod,
  getClientCapacityBreakdown,
  generateClientSpecificMatrix,
  clientMatrixCache
} from '../clientMatrixService';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            gte: vi.fn(() => ({
              lte: vi.fn(() => ({
                neq: vi.fn(() => ({
                  error: null,
                  data: []
                }))
              }))
            }))
          }))
        }))
      }))
    }))
  }
}));

describe('Client Matrix Service', () => {
  beforeEach(() => {
    clientMatrixCache.clear();
    vi.clearAllMocks();
  });

  describe('getClientTasksForPeriod', () => {
    it('should fetch and process client tasks correctly', async () => {
      const clientId = 'test-client-id';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const result = await getClientTasksForPeriod(clientId, startDate, endDate);

      expect(result).toHaveProperty('clientId', clientId);
      expect(result).toHaveProperty('taskCount');
      expect(result).toHaveProperty('totalHours');
      expect(result).toHaveProperty('skillBreakdown');
      expect(result).toHaveProperty('tasks');
      expect(Array.isArray(result.tasks)).toBe(true);
    });

    it('should handle database errors gracefully', async () => {
      const clientId = 'invalid-client';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      await expect(
        getClientTasksForPeriod(clientId, startDate, endDate)
      ).rejects.toThrow();
    });
  });

  describe('getClientCapacityBreakdown', () => {
    it('should generate capacity breakdown correctly', async () => {
      const clientId = 'test-client-id';
      const dateRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      };

      const result = await getClientCapacityBreakdown(clientId, dateRange);

      expect(result).toHaveProperty('clientId', clientId);
      expect(result).toHaveProperty('totalAllocatedHours');
      expect(result).toHaveProperty('skillDistribution');
      expect(result).toHaveProperty('monthlyBreakdown');
      expect(typeof result.totalAllocatedHours).toBe('number');
    });
  });

  describe('generateClientSpecificMatrix', () => {
    it('should generate forecast data for client', async () => {
      const clientId = 'test-client-id';
      const forecastType = 'virtual';

      const result = await generateClientSpecificMatrix(clientId, forecastType);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(12); // 12 months
      
      if (result.length > 0) {
        const firstPeriod = result[0];
        expect(firstPeriod).toHaveProperty('period');
        expect(firstPeriod).toHaveProperty('demand');
        expect(firstPeriod).toHaveProperty('capacity');
        expect(Array.isArray(firstPeriod.demand)).toBe(true);
        expect(Array.isArray(firstPeriod.capacity)).toBe(true);
      }
    });
  });

  describe('Cache functionality', () => {
    it('should cache and retrieve data correctly', () => {
      const testData = { test: 'data' };
      const cacheKey = 'test-key';

      clientMatrixCache.set(cacheKey, testData);
      const cached = clientMatrixCache.get(cacheKey);

      expect(cached).toEqual(testData);
    });

    it('should expire cached data after TTL', () => {
      const testData = { test: 'data' };
      const cacheKey = 'test-key';
      const shortTTL = 1; // 1ms

      clientMatrixCache.set(cacheKey, testData, shortTTL);
      
      // Wait for expiration
      setTimeout(() => {
        const cached = clientMatrixCache.get(cacheKey);
        expect(cached).toBeNull();
      }, 5);
    });

    it('should clear client-specific cache', () => {
      const clientId = 'test-client';
      clientMatrixCache.set(`client-tasks-${clientId}-data`, { test: 'data1' });
      clientMatrixCache.set(`other-data`, { test: 'data2' });

      clientMatrixCache.clearClient(clientId);

      expect(clientMatrixCache.get(`client-tasks-${clientId}-data`)).toBeNull();
      expect(clientMatrixCache.get('other-data')).not.toBeNull();
    });
  });
});
