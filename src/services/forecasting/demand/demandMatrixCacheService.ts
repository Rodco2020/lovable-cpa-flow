
import { format } from 'date-fns';
import { debugLog } from '../logger';
import { DemandMatrixData, DemandMatrixMode } from '@/types/demand';

/**
 * Demand Matrix Cache Service
 * Pure caching logic for demand matrix data with TTL management
 */
export class DemandMatrixCacheService {
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private static cache = new Map<string, { data: DemandMatrixData; timestamp: number }>();

  /**
   * Generate demand matrix cache key
   */
  static getDemandMatrixCacheKey(mode: DemandMatrixMode, startDate: Date): string {
    return `demand_matrix_${mode}_${format(startDate, 'yyyy-MM')}`;
  }

  /**
   * Get cached demand matrix data
   */
  static getCachedData(cacheKey: string): DemandMatrixData | null {
    const cached = this.cache.get(cacheKey);
    
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > this.CACHE_TTL;
    if (isExpired) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Cache demand matrix data with LRU eviction
   */
  static setCachedData(cacheKey: string, data: DemandMatrixData): void {
    // Simple LRU: remove oldest if cache is getting large
    if (this.cache.size >= 10) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear demand matrix cache
   */
  static clearCache(): void {
    this.cache.clear();
    debugLog('Demand matrix cache cleared');
  }

  /**
   * Get cache statistics
   */
  static getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      timestamps: Array.from(this.cache.values()).map(v => v.timestamp)
    };
  }
}
