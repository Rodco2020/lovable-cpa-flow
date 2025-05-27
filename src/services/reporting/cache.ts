
/**
 * Reporting Cache Manager
 * 
 * Handles caching specifically for reporting data with TTL support
 */

import { CacheEntry, CacheStats } from './types';

export class ReportingCacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL: number;

  constructor(defaultTTL: number = 5 * 60 * 1000) { // 5 minutes default
    this.defaultTTL = defaultTTL;
  }

  /**
   * Generate cache key from type and parameters
   */
  getCacheKey(type: string, params: any): string {
    return `${type}:${JSON.stringify(params)}`;
  }

  /**
   * Get data from cache if valid
   */
  getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Store data in cache with optional TTL
   */
  setCache<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Clear cache for specific report type or all cache
   */
  clearCache(type?: string): void {
    if (type) {
      const keysToDelete = Array.from(this.cache.keys()).filter(key => key.startsWith(type));
      keysToDelete.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

