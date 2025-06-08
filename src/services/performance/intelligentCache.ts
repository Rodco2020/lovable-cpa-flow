import { debugLog } from '@/services/forecasting/logger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccess: number;
  priority: 'low' | 'medium' | 'high';
}

interface CacheStats {
  totalEntries: number;
  hitRate: number;
  missRate: number;
  averageAccessTime: number;
  memoryUsage: number;
}

/**
 * Intelligent Cache Service
 * Provides smart caching with TTL, LRU eviction, and priority levels
 */
export class IntelligentCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize: number;
  private hitCount = 0;
  private missCount = 0;
  private accessTimes: number[] = [];

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
    
    // Cleanup interval every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Get cached data with intelligent access tracking
   */
  get<T>(key: string): T | null {
    const startTime = performance.now();
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.missCount++;
      debugLog(`Cache miss: ${key}`);
      return null;
    }
    
    // Check TTL
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.missCount++;
      debugLog(`Cache expired: ${key}`);
      return null;
    }
    
    // Update access statistics
    entry.accessCount++;
    entry.lastAccess = Date.now();
    this.hitCount++;
    
    const accessTime = performance.now() - startTime;
    this.accessTimes.push(accessTime);
    
    // Keep only last 100 access times for average calculation
    if (this.accessTimes.length > 100) {
      this.accessTimes = this.accessTimes.slice(-100);
    }
    
    debugLog(`Cache hit: ${key} (access time: ${accessTime.toFixed(2)}ms)`);
    return entry.data;
  }

  /**
   * Set cached data with priority and TTL
   */
  set<T>(
    key: string, 
    data: T, 
    ttl = 5 * 60 * 1000, // 5 minutes default
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): void {
    // Check if we need to evict entries
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccess: Date.now(),
      priority
    };

    this.cache.set(key, entry);
    debugLog(`Cache set: ${key} (TTL: ${ttl}ms, Priority: ${priority})`);
  }

  /**
   * Get or set pattern - fetch data if not cached
   */
  async getOrSet<T>(
    key: string,
    loader: () => Promise<T>,
    ttl = 5 * 60 * 1000,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const startTime = performance.now();
    const data = await loader();
    const loadTime = performance.now() - startTime;
    
    debugLog(`Data loaded for cache: ${key} (load time: ${loadTime.toFixed(2)}ms)`);
    
    this.set(key, data, ttl, priority);
    return data;
  }

  /**
   * Clear specific cache entry
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      debugLog(`Cache deleted: ${key}`);
    }
    return deleted;
  }

  /**
   * Clear cache entries matching pattern
   */
  invalidatePattern(pattern: RegExp): number {
    let deletedCount = 0;
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      deletedCount++;
    });

    debugLog(`Invalidated ${deletedCount} cache entries matching pattern`);
    return deletedCount;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
    this.accessTimes = [];
    debugLog('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? (this.hitCount / totalRequests) * 100 : 0;
    const missRate = totalRequests > 0 ? (this.missCount / totalRequests) * 100 : 0;
    const averageAccessTime = this.accessTimes.length > 0 
      ? this.accessTimes.reduce((sum, time) => sum + time, 0) / this.accessTimes.length 
      : 0;

    // Estimate memory usage (rough calculation)
    const memoryUsage = this.cache.size * 1024; // Rough estimate in bytes

    return {
      totalEntries: this.cache.size,
      hitRate: Number(hitRate.toFixed(2)),
      missRate: Number(missRate.toFixed(2)),
      averageAccessTime: Number(averageAccessTime.toFixed(2)),
      memoryUsage
    };
  }

  /**
   * Evict least recently used entries
   */
  private evictLeastUsed(): void {
    // Sort entries by priority (high -> medium -> low) and then by last access
    const entries = Array.from(this.cache.entries()).sort(([, a], [, b]) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      
      if (priorityDiff !== 0) {
        return priorityDiff; // Higher priority first
      }
      
      return a.lastAccess - b.lastAccess; // Earlier access first (LRU)
    });

    // Remove the least valuable entry (lowest priority, least recently used)
    const [keyToEvict] = entries[0];
    this.cache.delete(keyToEvict);
    debugLog(`Cache evicted: ${keyToEvict}`);
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      debugLog(`Cache cleanup: removed ${cleanedCount} expired entries`);
    }
  }

  /**
   * Warm up cache with frequently used data
   */
  async warmUp(tasks: Array<{
    key: string;
    loader: () => Promise<any>;
    ttl?: number;
    priority?: 'low' | 'medium' | 'high';
  }>): Promise<void> {
    debugLog(`Cache warm-up started: ${tasks.length} tasks`);
    
    const promises = tasks.map(async ({ key, loader, ttl, priority }) => {
      try {
        const data = await loader();
        this.set(key, data, ttl, priority);
      } catch (error) {
        console.warn(`Cache warm-up failed for ${key}:`, error);
      }
    });

    await Promise.allSettled(promises);
    debugLog('Cache warm-up completed');
  }
}

// Global cache instance
export const intelligentCache = new IntelligentCache(1000);
