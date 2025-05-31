
import { MatrixCacheManager } from '../cache/matrixCacheManager';
import { EnhancedMatrixResult } from './types';

/**
 * Enhanced Cache Manager
 * Provides simplified interface to the matrix cache
 */
export class EnhancedCacheManager {
  /**
   * Get cached matrix data with analytics
   */
  static getCachedResult(
    forecastType: 'virtual' | 'actual',
    includeAnalytics: boolean
  ): EnhancedMatrixResult | null {
    const cached = MatrixCacheManager.getCachedData(forecastType, includeAnalytics);
    
    if (!cached) return null;
    
    return {
      matrixData: cached.data,
      trends: cached.trends,
      recommendations: cached.recommendations,
      alerts: cached.alerts,
      performance: {
        dataLoadTime: 0,
        analysisTime: 0,
        renderTime: 0,
        totalCells: cached.data.dataPoints.length,
        cacheHit: true
      }
    };
  }

  /**
   * Cache enhanced matrix results
   */
  static setCachedResult(
    forecastType: 'virtual' | 'actual',
    includeAnalytics: boolean,
    result: Omit<EnhancedMatrixResult, 'performance'>
  ): void {
    MatrixCacheManager.setCachedData(forecastType, includeAnalytics, {
      data: result.matrixData,
      trends: result.trends,
      recommendations: result.recommendations,
      alerts: result.alerts
    });
  }

  /**
   * Clear cache
   */
  static clearCache(forecastType?: 'virtual' | 'actual'): void {
    MatrixCacheManager.clearCache(forecastType);
  }

  /**
   * Get cache statistics
   */
  static getCacheStats() {
    return MatrixCacheManager.getCacheStats();
  }
}
