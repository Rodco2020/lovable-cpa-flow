
/**
 * Enhanced Cache Service
 * 
 * Provides multi-level caching with TTL, LRU eviction,
 * performance monitoring, and cache analytics
 */

import { logError } from '@/services/errorLoggingService';
import { performanceMonitoringService } from '@/services/performanceMonitoringService';
import { 
  CacheEntry, 
  CacheConfig, 
  CacheStats, 
  CacheWarmUpLoader, 
  CacheDiagnostics 
} from './types';
import { calculateDataSize, isEntryExpired } from './utils';
import { CacheMetrics } from './metrics';
import { CacheCleanupManager } from './cleanup';

export class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private config: CacheConfig;
  private metrics: CacheMetrics;
  private cleanupManager: CacheCleanupManager<any>;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 1000,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxMemoryUsage: 50 * 1024 * 1024, // 50MB
      enableMetrics: true,
      cleanupInterval: 60 * 1000, // 1 minute
      ...config
    };

    this.metrics = new CacheMetrics();
    this.cleanupManager = new CacheCleanupManager(this.cache, this.config, this.metrics);
    this.cleanupManager.startCleanupTimer();
  }

  /**
   * Get item from cache with performance monitoring
   */
  get<T>(key: string): T | null {
    const timingId = this.config.enableMetrics 
      ? performanceMonitoringService.startTiming('cache-get', 'CacheService', { cacheKey: key })
      : null;

    const entry = this.cache.get(key);
    
    if (timingId) {
      performanceMonitoringService.endTiming(timingId);
    }

    if (!entry) {
      this.metrics.recordMiss();
      return null;
    }

    // Check if expired
    if (isEntryExpired(entry)) {
      this.cache.delete(key);
      this.metrics.recordMiss();
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.metrics.recordHit();

    return entry.data;
  }

  /**
   * Set item in cache with size calculation and eviction
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const timingId = this.config.enableMetrics 
      ? performanceMonitoringService.startTiming('cache-set', 'CacheService', { cacheKey: key })
      : null;

    try {
      const size = calculateDataSize(data);
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttl || this.config.defaultTTL,
        accessCount: 1,
        lastAccessed: Date.now(),
        size
      };

      // Check memory constraints before adding
      if (this.cleanupManager.shouldEvict(size)) {
        this.cleanupManager.evictLeastRecentlyUsed();
      }

      this.cache.set(key, entry);

      // Ensure we don't exceed size limits
      this.cleanupManager.enforceMaxSize();
    } catch (error) {
      logError('Cache set operation failed', 'error', {
        component: 'CacheService',
        details: error instanceof Error ? error.message : 'Unknown error',
        data: { cacheKey: key }
      });
    } finally {
      if (timingId) {
        performanceMonitoringService.endTiming(timingId);
      }
    }
  }

  /**
   * Get or set pattern with async loader
   */
  async getOrSet<T>(
    key: string, 
    loader: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const timingId = this.config.enableMetrics 
      ? performanceMonitoringService.startTiming('cache-load', 'CacheService', { cacheKey: key })
      : null;

    try {
      const data = await loader();
      this.set(key, data, ttl);
      return data;
    } finally {
      if (timingId) {
        performanceMonitoringService.endTiming(timingId);
      }
    }
  }

  /**
   * Delete specific cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.metrics.reset();
  }

  /**
   * Clear expired entries
   */
  clearExpired(): number {
    return this.cleanupManager.clearExpired();
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return this.metrics.calculateStats(this.cache);
  }

  /**
   * Get cache entries with pattern matching
   */
  getByPattern(pattern: RegExp): Array<{ key: string; data: any }> {
    const results: Array<{ key: string; data: any }> = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (pattern.test(key)) {
        // Check if not expired
        if (!isEntryExpired(entry)) {
          results.push({ key, data: entry.data });
        }
      }
    }

    return results;
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidatePattern(pattern: RegExp): number {
    let deletedCount = 0;
    
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Warm up cache with common queries
   */
  async warmUp(loaders: CacheWarmUpLoader[]): Promise<void> {
    const timingId = this.config.enableMetrics 
      ? performanceMonitoringService.startTiming('cache-warmup', 'CacheService')
      : null;

    try {
      const promises = loaders.map(async ({ key, loader, ttl }) => {
        try {
          const data = await loader();
          this.set(key, data, ttl);
        } catch (error) {
          logError(`Cache warm-up failed for key: ${key}`, 'warning', {
            component: 'CacheService',
            details: error instanceof Error ? error.message : 'Unknown error',
            data: { cacheKey: key }
          });
        }
      });

      await Promise.all(promises);
      console.log(`Cache warmed up with ${loaders.length} entries`);
    } finally {
      if (timingId) {
        performanceMonitoringService.endTiming(timingId);
      }
    }
  }

  /**
   * Destroy cache service and cleanup resources
   */
  destroy(): void {
    this.cleanupManager.stopCleanupTimer();
    this.clear();
  }

  /**
   * Export cache configuration and statistics
   */
  exportDiagnostics(): CacheDiagnostics {
    return {
      config: this.config,
      stats: this.getStats(),
      internalStats: this.metrics.getInternalStats(),
      memoryUsage: Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.size, 0)
    };
  }
}
