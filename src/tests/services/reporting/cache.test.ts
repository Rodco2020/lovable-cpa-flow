
/**
 * Reporting Cache Manager Tests
 */

import { ReportingCacheManager } from '@/services/reporting/cache';

describe('ReportingCacheManager', () => {
  let cache: ReportingCacheManager;

  beforeEach(() => {
    cache = new ReportingCacheManager(1000); // 1 second TTL
  });

  it('should store and retrieve data', () => {
    const testData = { test: 'value' };
    const key = cache.getCacheKey('test-type', { param: 'value' });
    cache.setCache(key, testData);
    
    const retrieved = cache.getFromCache(key);
    expect(retrieved).toEqual(testData);
  });

  it('should return null for expired data', async () => {
    const testData = { test: 'value' };
    const key = cache.getCacheKey('test-type', { param: 'value' });
    cache.setCache(key, testData);
    
    // Wait for TTL to expire
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    const retrieved = cache.getFromCache(key);
    expect(retrieved).toBeNull();
  });

  it('should clear cache by type', () => {
    cache.setCache('client-report:key1', 'value1');
    cache.setCache('staff-report:key2', 'value2');
    cache.setCache('other:key3', 'value3');
    
    cache.clearCache('client-report');
    
    expect(cache.getFromCache('client-report:key1')).toBeNull();
    expect(cache.getFromCache('staff-report:key2')).toBe('value2');
    expect(cache.getFromCache('other:key3')).toBe('value3');
  });

  it('should provide cache statistics', () => {
    cache.setCache('key1', 'value1');
    cache.setCache('key2', 'value2');
    
    const stats = cache.getCacheStats();
    expect(stats.size).toBe(2);
    expect(stats.entries).toContain('key1');
    expect(stats.entries).toContain('key2');
  });
});

