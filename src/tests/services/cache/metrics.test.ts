
/**
 * Cache Metrics Tests
 */

import { CacheMetrics } from '@/services/cache/metrics';
import { CacheEntry } from '@/services/cache/types';

describe('CacheMetrics', () => {
  let metrics: CacheMetrics;

  beforeEach(() => {
    metrics = new CacheMetrics();
  });

  it('should track hits and misses', () => {
    metrics.recordHit();
    metrics.recordHit();
    metrics.recordMiss();

    const stats = metrics.getInternalStats();
    expect(stats.hits).toBe(2);
    expect(stats.misses).toBe(1);
    expect(stats.totalRequests).toBe(3);
  });

  it('should calculate cache stats correctly', () => {
    const cache = new Map<string, CacheEntry<any>>();
    const now = Date.now();
    
    cache.set('key1', {
      data: 'value1',
      timestamp: now - 1000,
      ttl: 5000,
      accessCount: 3,
      lastAccessed: now,
      size: 100
    });

    metrics.recordHit();
    metrics.recordHit();
    
    const stats = metrics.calculateStats(cache);
    expect(stats.totalEntries).toBe(1);
    expect(stats.totalSize).toBe(100);
    expect(stats.hitRate).toBe(100);
  });

  it('should reset stats correctly', () => {
    metrics.recordHit();
    metrics.recordMiss();
    metrics.reset();

    const stats = metrics.getInternalStats();
    expect(stats.hits).toBe(0);
    expect(stats.misses).toBe(0);
    expect(stats.totalRequests).toBe(0);
  });
});
