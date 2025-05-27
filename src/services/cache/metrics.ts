
/**
 * Cache Metrics Tracking
 * 
 * Handles performance monitoring and statistics for cache operations
 */

import { CacheStats, CacheEntry } from './types';

export class CacheMetrics {
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalRequests: 0
  };

  recordHit(): void {
    this.stats.hits++;
    this.stats.totalRequests++;
  }

  recordMiss(): void {
    this.stats.misses++;
    this.stats.totalRequests++;
  }

  recordEviction(): void {
    this.stats.evictions++;
  }

  getInternalStats() {
    return { ...this.stats };
  }

  calculateStats<T>(cache: Map<string, CacheEntry<T>>): CacheStats {
    const entries = Array.from(cache.values());
    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
    const totalAccessCount = entries.reduce((sum, entry) => sum + entry.accessCount, 0);
    
    const timestamps = entries.map(e => e.timestamp);
    const oldest = timestamps.length > 0 ? Math.min(...timestamps) : 0;
    const newest = timestamps.length > 0 ? Math.max(...timestamps) : 0;

    return {
      totalEntries: cache.size,
      totalSize,
      hitRate: this.stats.totalRequests > 0 
        ? (this.stats.hits / this.stats.totalRequests) * 100 
        : 0,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      averageAccessCount: entries.length > 0 ? totalAccessCount / entries.length : 0,
      oldestEntry: oldest,
      newestEntry: newest
    };
  }

  reset(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0
    };
  }
}
