
/**
 * Revenue Cache Manager Tests
 */

import { RevenueCacheManager } from '@/services/revenue/cache';

describe('RevenueCacheManager', () => {
  let cache: RevenueCacheManager;

  beforeEach(() => {
    cache = new RevenueCacheManager(1000); // 1 second TTL
  });

  it('should store and retrieve data', () => {
    const testData = { test: 'value' };
    cache.set('test-key', testData);
    
    const retrieved = cache.get('test-key');
    expect(retrieved).toEqual(testData);
  });

  it('should return null for expired data', async () => {
    const testData = { test: 'value' };
    cache.set('test-key', testData);
    
    // Wait for TTL to expire
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    const retrieved = cache.get('test-key');
    expect(retrieved).toBeNull();
  });

  it('should clear all cache', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    
    expect(cache.size()).toBe(2);
    
    cache.clear();
    expect(cache.size()).toBe(0);
  });
});
