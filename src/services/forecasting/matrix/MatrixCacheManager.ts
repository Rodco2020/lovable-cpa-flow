
import { MatrixData, MatrixCacheEntry, ForecastType } from './types';
import { MATRIX_CONSTANTS } from './constants';
import { debugLog } from '../logger';

/**
 * Matrix Cache Manager
 * Centralized caching logic for matrix data
 */
export class MatrixCacheManager {
  private static cache = new Map<string, MatrixCacheEntry>();
  
  /**
   * Generate cache key for matrix data
   */
  static getCacheKey(forecastType: ForecastType, startDate: Date): string {
    const year = startDate.getFullYear();
    const month = startDate.getMonth() + 1;
    return `unified_matrix_${forecastType}_${year}_${month.toString().padStart(2, '0')}`;
  }
  
  /**
   * Get cached matrix data if valid
   */
  static getCachedData(forecastType: ForecastType, startDate: Date): MatrixData | null {
    try {
      const cacheKey = this.getCacheKey(forecastType, startDate);
      const entry = this.cache.get(cacheKey);
      
      if (!entry) {
        debugLog('Cache miss', { cacheKey });
        return null;
      }
      
      // Check if cache entry is still valid
      const isValid = (Date.now() - entry.timestamp) < MATRIX_CONSTANTS.CACHE_TTL_MS;
      if (!isValid) {
        debugLog('Cache expired', { cacheKey, age: Date.now() - entry.timestamp });
        this.cache.delete(cacheKey);
        return null;
      }
      
      debugLog('Cache hit', { cacheKey });
      return entry.data;
      
    } catch (error) {
      console.error('Error retrieving cached data:', error);
      return null;
    }
  }
  
  /**
   * Store matrix data in cache
   */
  static setCachedData(forecastType: ForecastType, startDate: Date, data: MatrixData): void {
    try {
      const cacheKey = this.getCacheKey(forecastType, startDate);
      
      // Check cache size limit
      if (this.cache.size >= MATRIX_CONSTANTS.MAX_CACHE_ENTRIES) {
        this.cleanupOldEntries();
      }
      
      const entry: MatrixCacheEntry = {
        data,
        timestamp: Date.now(),
        cacheKey
      };
      
      this.cache.set(cacheKey, entry);
      debugLog('Data cached', { cacheKey, cacheSize: this.cache.size });
      
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }
  
  /**
   * Clear all cached data
   */
  static clearCache(): void {
    const previousSize = this.cache.size;
    this.cache.clear();
    debugLog('Cache cleared', { previousSize });
  }
  
  /**
   * Clear expired cache entries
   */
  static clearExpiredEntries(): void {
    const now = Date.now();
    let removedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if ((now - entry.timestamp) >= MATRIX_CONSTANTS.CACHE_TTL_MS) {
        this.cache.delete(key);
        removedCount++;
      }
    }
    
    if (removedCount > 0) {
      debugLog('Expired cache entries cleared', { removedCount, remainingSize: this.cache.size });
    }
  }
  
  /**
   * Get cache statistics
   */
  static getCacheStats() {
    const entries = Array.from(this.cache.values());
    const now = Date.now();
    
    return {
      totalEntries: entries.length,
      validEntries: entries.filter(entry => (now - entry.timestamp) < MATRIX_CONSTANTS.CACHE_TTL_MS).length,
      expiredEntries: entries.filter(entry => (now - entry.timestamp) >= MATRIX_CONSTANTS.CACHE_TTL_MS).length,
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : null,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => e.timestamp)) : null
    };
  }
  
  /**
   * Remove oldest cache entries when limit exceeded
   */
  private static cleanupOldEntries(): void {
    if (this.cache.size < MATRIX_CONSTANTS.MAX_CACHE_ENTRIES) {
      return;
    }
    
    // Sort entries by timestamp and remove oldest ones
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);
    
    const entriesToRemove = Math.floor(MATRIX_CONSTANTS.MAX_CACHE_ENTRIES * 0.2); // Remove 20%
    
    for (let i = 0; i < entriesToRemove && i < entries.length; i++) {
      this.cache.delete(entries[i][0]);
    }
    
    debugLog('Cache cleanup completed', { 
      entriesRemoved: entriesToRemove, 
      remainingSize: this.cache.size 
    });
  }
}
