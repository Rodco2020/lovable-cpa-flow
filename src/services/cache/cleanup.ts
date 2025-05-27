
/**
 * Cache Cleanup Manager
 * 
 * Handles automatic cleanup of expired entries and memory management
 */

import { CacheEntry, CacheConfig } from './types';
import { isEntryExpired, findLRUKey, calculateMemoryUsage } from './utils';
import { CacheMetrics } from './metrics';

export class CacheCleanupManager<T> {
  private cleanupTimer?: NodeJS.Timeout;

  constructor(
    private cache: Map<string, CacheEntry<T>>,
    private config: CacheConfig,
    private metrics: CacheMetrics
  ) {}

  startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.clearExpired();
    }, this.config.cleanupInterval);
  }

  stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }

  clearExpired(): number {
    const now = Date.now();
    const initialSize = this.cache.size;
    
    for (const [key, entry] of this.cache.entries()) {
      if (isEntryExpired({ timestamp: entry.timestamp, ttl: entry.ttl })) {
        this.cache.delete(key);
      }
    }

    const clearedCount = initialSize - this.cache.size;
    if (clearedCount > 0) {
      console.log(`Cleared ${clearedCount} expired cache entries`);
    }
    return clearedCount;
  }

  shouldEvict(newEntrySize: number): boolean {
    const currentSize = calculateMemoryUsage(this.cache);
    return currentSize + newEntrySize > this.config.maxMemoryUsage;
  }

  evictLeastRecentlyUsed(): void {
    if (this.cache.size === 0) return;

    const lruKey = findLRUKey(this.cache);
    if (lruKey) {
      this.cache.delete(lruKey);
      this.metrics.recordEviction();
    }
  }

  enforceMaxSize(): void {
    while (this.cache.size > this.config.maxSize) {
      this.evictLeastRecentlyUsed();
    }
  }
}
