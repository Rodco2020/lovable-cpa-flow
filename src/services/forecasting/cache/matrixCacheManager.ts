
import { MatrixData } from '../matrixUtils';
import { 
  TrendAnalysis,
  CapacityRecommendation,
  ThresholdAlert
} from '../analyticsService';
import { debugLog } from '../logger';

// Cache interface
export interface MatrixCache {
  data: MatrixData;
  trends: TrendAnalysis[];
  recommendations: CapacityRecommendation[];
  alerts: ThresholdAlert[];
  generatedAt: Date;
  forecastType: 'virtual' | 'actual';
}

// Performance metrics interface
export interface PerformanceMetrics {
  dataLoadTime: number;
  analysisTime: number;
  renderTime: number;
  totalCells: number;
  cacheHit: boolean;
}

/**
 * Matrix Cache Manager
 * Handles caching operations for matrix data and analytics
 */
export class MatrixCacheManager {
  private static cache = new Map<string, MatrixCache>();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private static readonly MAX_CACHE_SIZE = 10;

  /**
   * Get cached matrix data if valid
   */
  static getCachedData(
    forecastType: 'virtual' | 'actual',
    includeAnalytics: boolean
  ): MatrixCache | null {
    const cacheKey = this.getCacheKey(forecastType, includeAnalytics);
    
    if (!this.cache.has(cacheKey)) {
      return null;
    }

    const cached = this.cache.get(cacheKey)!;
    const isExpired = Date.now() - cached.generatedAt.getTime() > this.CACHE_TTL;
    
    if (isExpired) {
      this.cache.delete(cacheKey);
      return null;
    }

    debugLog('Using cached matrix data');
    return cached;
  }

  /**
   * Store data in cache with LRU eviction
   */
  static setCachedData(
    forecastType: 'virtual' | 'actual',
    includeAnalytics: boolean,
    data: Omit<MatrixCache, 'generatedAt' | 'forecastType'>
  ): void {
    const cacheKey = this.getCacheKey(forecastType, includeAnalytics);
    
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }
    
    const cacheData: MatrixCache = {
      ...data,
      generatedAt: new Date(),
      forecastType
    };
    
    this.cache.set(cacheKey, cacheData);
    debugLog(`Matrix data cached with key: ${cacheKey}`);
  }

  /**
   * Clear cache for specific forecast type or all
   */
  static clearCache(forecastType?: 'virtual' | 'actual'): void {
    if (forecastType) {
      Array.from(this.cache.keys())
        .filter(key => key.includes(forecastType))
        .forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
    
    debugLog('Cache cleared', { forecastType });
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    entries: Array<{
      key: string;
      age: number;
      size: number;
    }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, value]) => ({
      key,
      age: Date.now() - value.generatedAt.getTime(),
      size: JSON.stringify(value).length
    }));

    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      hitRate: 0, // This would be tracked separately in a real implementation
      entries
    };
  }

  /**
   * Generate cache key
   */
  private static getCacheKey(forecastType: string, includeAnalytics: boolean): string {
    return `matrix_${forecastType}_${includeAnalytics}`;
  }
}
