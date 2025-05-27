import { logError } from '@/services/errorLoggingService';
import { performanceMonitoringService } from '@/services/performanceMonitoringService';

/**
 * Enhanced Cache Service
 * 
 * Provides multi-level caching with TTL, LRU eviction,
 * performance monitoring, and cache analytics
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
}

interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  totalHits: number;
  totalMisses: number;
  averageAccessCount: number;
  oldestEntry: number;
  newestEntry: number;
}

interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  maxMemoryUsage: number; // in bytes
  enableMetrics: boolean;
  cleanupInterval: number; // in milliseconds
}

class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private config: CacheConfig;
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalRequests: 0
  };
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 1000,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxMemoryUsage: 50 * 1024 * 1024, // 50MB
      enableMetrics: true,
      cleanupInterval: 60 * 1000, // 1 minute
      ...config
    };

    this.startCleanupTimer();
  }

  /**
   * Get item from cache with performance monitoring
   */
  get<T>(key: string): T | null {
    this.stats.totalRequests++;
    
    const timingId = this.config.enableMetrics 
      ? performanceMonitoringService.startTiming('cache-get', 'CacheService', { cacheKey: key })
      : null;

    const entry = this.cache.get(key);
    
    if (timingId) {
      performanceMonitoringService.endTiming(timingId);
    }

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;

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
      const size = this.calculateSize(data);
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttl || this.config.defaultTTL,
        accessCount: 1,
        lastAccessed: Date.now(),
        size
      };

      // Check memory constraints before adding
      if (this.shouldEvict(size)) {
        this.evictLeastRecentlyUsed();
      }

      this.cache.set(key, entry);

      // Ensure we don't exceed size limits
      this.enforceMaxSize();
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
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0
    };
  }

  /**
   * Clear expired entries
   */
  clearExpired(): number {
    const now = Date.now();
    const initialSize = this.cache.size;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }

    const clearedCount = initialSize - this.cache.size;
    console.log(`Cleared ${clearedCount} expired cache entries`);
    return clearedCount;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
    const totalAccessCount = entries.reduce((sum, entry) => sum + entry.accessCount, 0);
    
    const timestamps = entries.map(e => e.timestamp);
    const oldest = timestamps.length > 0 ? Math.min(...timestamps) : 0;
    const newest = timestamps.length > 0 ? Math.max(...timestamps) : 0;

    return {
      totalEntries: this.cache.size,
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

  /**
   * Get cache entries with pattern matching
   */
  getByPattern(pattern: RegExp): Array<{ key: string; data: any }> {
    const results: Array<{ key: string; data: any }> = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (pattern.test(key)) {
        // Check if not expired
        if (Date.now() - entry.timestamp <= entry.ttl) {
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
  async warmUp(loaders: Array<{ key: string; loader: () => Promise<any>; ttl?: number }>): Promise<void> {
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

  private calculateSize(data: any): number {
    try {
      return JSON.stringify(data).length * 2; // Rough estimate: 2 bytes per character
    } catch {
      return 1024; // Default size if calculation fails
    }
  }

  private shouldEvict(newEntrySize: number): boolean {
    const currentSize = this.getCurrentMemoryUsage();
    return currentSize + newEntrySize > this.config.maxMemoryUsage;
  }

  private getCurrentMemoryUsage(): number {
    return Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.size, 0);
  }

  private evictLeastRecentlyUsed(): void {
    if (this.cache.size === 0) return;

    let lruKey: string | null = null;
    let lruTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
      this.stats.evictions++;
    }
  }

  private enforceMaxSize(): void {
    while (this.cache.size > this.config.maxSize) {
      this.evictLeastRecentlyUsed();
    }
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.clearExpired();
    }, this.config.cleanupInterval);
  }

  /**
   * Destroy cache service and cleanup resources
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }

  /**
   * Export cache configuration and statistics
   */
  exportDiagnostics() {
    return {
      config: this.config,
      stats: this.getStats(),
      internalStats: this.stats,
      memoryUsage: this.getCurrentMemoryUsage()
    };
  }
}

// Create global cache instances for different use cases
export const queryCache = new CacheService({
  maxSize: 500,
  defaultTTL: 5 * 60 * 1000, // 5 minutes for query results
  maxMemoryUsage: 20 * 1024 * 1024 // 20MB
});

export const reportCache = new CacheService({
  maxSize: 100,
  defaultTTL: 15 * 60 * 1000, // 15 minutes for reports
  maxMemoryUsage: 30 * 1024 * 1024 // 30MB
});

export const metadataCache = new CacheService({
  maxSize: 200,
  defaultTTL: 30 * 60 * 1000, // 30 minutes for metadata
  maxMemoryUsage: 5 * 1024 * 1024 // 5MB
});

export default CacheService;
