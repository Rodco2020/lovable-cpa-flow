
/**
 * Cache Manager
 * Manages caching operations for performance optimization
 */

import { CacheEntry } from './types';
import { PERFORMANCE_CONSTANTS, CACHE_KEYS } from './constants';

export class CacheManager {
  private static cache = new Map<string, CacheEntry<any>>();
  
  /**
   * Get cached data
   */
  static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.expiryMs) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  /**
   * Set cached data
   */
  static set<T>(
    key: string,
    data: T,
    expiryMs: number = PERFORMANCE_CONSTANTS.DEFAULT_CACHE_DURATION
  ): void {
    // Implement cache size limit
    if (this.cache.size >= PERFORMANCE_CONSTANTS.MAX_CACHE_SIZE) {
      this.evictOldest();
    }
    
    this.cache.set(key, {
      data: structuredClone(data),
      timestamp: Date.now(),
      expiryMs
    });
  }
  
  /**
   * Clear cache entry
   */
  static delete(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Clear all cache
   */
  static clear(): void {
    this.cache.clear();
  }
  
  /**
   * Get cache statistics
   */
  static getStats(): {
    size: number;
    memoryUsageMB: number;
    oldestEntry: number;
  } {
    let totalMemory = 0;
    let oldestTimestamp = Date.now();
    
    for (const [, entry] of this.cache) {
      totalMemory += JSON.stringify(entry.data).length;
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
      }
    }
    
    return {
      size: this.cache.size,
      memoryUsageMB: totalMemory / (1024 * 1024),
      oldestEntry: oldestTimestamp
    };
  }
  
  /**
   * Evict oldest cache entry
   */
  private static evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();
    
    for (const [key, entry] of this.cache) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}
