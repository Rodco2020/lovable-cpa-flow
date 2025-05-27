
/**
 * Cache Utility Functions
 * 
 * Provides helper functions for cache operations
 */

/**
 * Calculate approximate size of data in bytes
 */
export const calculateDataSize = (data: any): number => {
  try {
    return JSON.stringify(data).length * 2; // Rough estimate: 2 bytes per character
  } catch {
    return 1024; // Default size if calculation fails
  }
};

/**
 * Check if cache entry is expired
 */
export const isEntryExpired = (entry: { timestamp: number; ttl: number }): boolean => {
  return Date.now() - entry.timestamp > entry.ttl;
};

/**
 * Find least recently used entry key
 */
export const findLRUKey = <T>(cache: Map<string, { lastAccessed: number }>): string | null => {
  if (cache.size === 0) return null;

  let lruKey: string | null = null;
  let lruTime = Date.now();

  for (const [key, entry] of cache.entries()) {
    if (entry.lastAccessed < lruTime) {
      lruTime = entry.lastAccessed;
      lruKey = key;
    }
  }

  return lruKey;
};

/**
 * Calculate current memory usage from cache entries
 */
export const calculateMemoryUsage = <T>(cache: Map<string, { size: number }>): number => {
  return Array.from(cache.values()).reduce((sum, entry) => sum + entry.size, 0);
};
