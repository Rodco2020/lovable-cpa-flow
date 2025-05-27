
/**
 * Cache Utilities Tests
 */

import { calculateDataSize, isEntryExpired, findLRUKey, calculateMemoryUsage } from '@/services/cache/utils';

describe('Cache Utils', () => {
  describe('calculateDataSize', () => {
    it('should calculate size for simple objects', () => {
      const data = { name: 'test', value: 123 };
      const size = calculateDataSize(data);
      expect(size).toBeGreaterThan(0);
    });

    it('should return default size for non-serializable data', () => {
      const circular: any = {};
      circular.self = circular;
      const size = calculateDataSize(circular);
      expect(size).toBe(1024);
    });
  });

  describe('isEntryExpired', () => {
    it('should return true for expired entries', () => {
      const entry = {
        timestamp: Date.now() - 10000, // 10 seconds ago
        ttl: 5000 // 5 second TTL
      };
      expect(isEntryExpired(entry)).toBe(true);
    });

    it('should return false for non-expired entries', () => {
      const entry = {
        timestamp: Date.now() - 1000, // 1 second ago
        ttl: 5000 // 5 second TTL
      };
      expect(isEntryExpired(entry)).toBe(false);
    });
  });

  describe('findLRUKey', () => {
    it('should find least recently used key', () => {
      const cache = new Map([
        ['key1', { lastAccessed: 1000 }],
        ['key2', { lastAccessed: 500 }], // oldest
        ['key3', { lastAccessed: 1500 }]
      ]);
      
      expect(findLRUKey(cache)).toBe('key2');
    });

    it('should return null for empty cache', () => {
      const cache = new Map();
      expect(findLRUKey(cache)).toBeNull();
    });
  });

  describe('calculateMemoryUsage', () => {
    it('should calculate total memory usage', () => {
      const cache = new Map([
        ['key1', { size: 100 }],
        ['key2', { size: 200 }],
        ['key3', { size: 300 }]
      ]);
      
      expect(calculateMemoryUsage(cache)).toBe(600);
    });
  });
});
