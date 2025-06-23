
/**
 * Performance Optimized Demand Matrix Controls
 * Enhanced controls with performance monitoring and optimization
 */

import { useState, useCallback, useMemo } from 'react';
import { DemandMatrixData } from '@/types/demand';
import { StaffDataOptimizer } from '@/services/forecasting/demand/performance/staffDataOptimizer';

export interface OptimizedControlsConfig {
  enablePerformanceTracking?: boolean;
  cacheStrategy?: 'aggressive' | 'conservative' | 'disabled';
  batchUpdates?: boolean;
  debounceMs?: number;
}

export interface PerformanceTrackingData {
  lastFilterTime: number;
  totalFilterOperations: number;
  averageFilterTime: number;
  cacheHitRate: number;
  memoryUsage: number;
}

export const usePerformanceOptimizedControls = (
  demandData: DemandMatrixData | null,
  config: OptimizedControlsConfig = {}
) => {
  const [performanceData, setPerformanceData] = useState<PerformanceTrackingData>({
    lastFilterTime: 0,
    totalFilterOperations: 0,
    averageFilterTime: 0,
    cacheHitRate: 0,
    memoryUsage: 0
  });

  const [filterCache] = useState(new Map<string, any>());

  // Configuration with defaults
  const optimizedConfig = useMemo(() => ({
    enablePerformanceTracking: true,
    cacheStrategy: 'conservative' as const,
    batchUpdates: true,
    debounceMs: 300,
    ...config
  }), [config]);

  /**
   * Optimized filter operation with performance tracking
   */
  const performOptimizedFilter = useCallback(async (
    filterType: 'skills' | 'clients' | 'staff' | 'time',
    filterValue: any
  ) => {
    const startTime = performance.now();
    
    try {
      // Generate cache key
      const cacheKey = `${filterType}-${JSON.stringify(filterValue)}`;
      
      // Check cache if enabled
      if (optimizedConfig.cacheStrategy !== 'disabled') {
        const cached = filterCache.get(cacheKey);
        if (cached && cached.timestamp > Date.now() - 60000) { // 1 minute cache
          const filterTime = performance.now() - startTime;
          updatePerformanceMetrics(filterTime, true);
          return cached.result;
        }
      }
      
      // Perform actual filtering
      let result;
      switch (filterType) {
        case 'staff':
          const { data, metrics } = await StaffDataOptimizer.fetchStaffDataOptimized();
          result = StaffDataOptimizer.filterStaffOptimized(data, filterValue);
          break;
        default:
          result = performStandardFilter(filterType, filterValue);
      }
      
      // Cache result if enabled
      if (optimizedConfig.cacheStrategy !== 'disabled') {
        filterCache.set(cacheKey, {
          result,
          timestamp: Date.now()
        });
      }
      
      const filterTime = performance.now() - startTime;
      updatePerformanceMetrics(filterTime, false);
      
      return result;
      
    } catch (error) {
      console.error(`Optimized filter error for ${filterType}:`, error);
      const filterTime = performance.now() - startTime;
      updatePerformanceMetrics(filterTime, false);
      throw error;
    }
  }, [optimizedConfig, filterCache, demandData]);

  /**
   * Batch update multiple filters for better performance
   */
  const batchUpdateFilters = useCallback(async (
    updates: Array<{
      type: 'skills' | 'clients' | 'staff' | 'time';
      value: any;
    }>
  ) => {
    if (!optimizedConfig.batchUpdates) {
      // Perform updates sequentially
      const results = [];
      for (const update of updates) {
        const result = await performOptimizedFilter(update.type, update.value);
        results.push(result);
      }
      return results;
    }
    
    // Perform batch operations
    const startTime = performance.now();
    
    try {
      const batchOperations = updates.map(update => ({
        type: 'filter' as const,
        params: {
          filterType: update.type,
          filterValue: update.value
        }
      }));
      
      const results = await StaffDataOptimizer.batchOptimizeStaffOperations(batchOperations);
      
      const batchTime = performance.now() - startTime;
      updatePerformanceMetrics(batchTime, false);
      
      return results;
      
    } catch (error) {
      console.error('Batch filter update error:', error);
      throw error;
    }
  }, [optimizedConfig, performOptimizedFilter]);

  /**
   * Clear performance cache and reset metrics
   */
  const clearPerformanceCache = useCallback(() => {
    filterCache.clear();
    StaffDataOptimizer.clearCache();
    
    setPerformanceData({
      lastFilterTime: 0,
      totalFilterOperations: 0,
      averageFilterTime: 0,
      cacheHitRate: 0,
      memoryUsage: 0
    });
  }, [filterCache]);

  /**
   * Get comprehensive performance report
   */
  const getPerformanceReport = useCallback(() => {
    const cacheStats = StaffDataOptimizer.getCacheStats();
    
    return {
      ...performanceData,
      cacheStats,
      filterCacheSize: filterCache.size,
      recommendations: generatePerformanceRecommendations(performanceData, cacheStats)
    };
  }, [performanceData, filterCache]);

  // Helper function to update performance metrics
  const updatePerformanceMetrics = useCallback((filterTime: number, cacheHit: boolean) => {
    if (!optimizedConfig.enablePerformanceTracking) return;
    
    setPerformanceData(prev => {
      const newTotal = prev.totalFilterOperations + 1;
      const newAverage = ((prev.averageFilterTime * prev.totalFilterOperations) + filterTime) / newTotal;
      const cacheHits = cacheHit ? 1 : 0;
      const newCacheHitRate = ((prev.cacheHitRate * prev.totalFilterOperations) + cacheHits) / newTotal;
      
      return {
        lastFilterTime: filterTime,
        totalFilterOperations: newTotal,
        averageFilterTime: newAverage,
        cacheHitRate: newCacheHitRate,
        memoryUsage: getMemoryUsage()
      };
    });
  }, [optimizedConfig]);

  // Helper function to perform standard filtering
  const performStandardFilter = useCallback((filterType: string, filterValue: any) => {
    if (!demandData) return null;
    
    // Standard filtering logic for non-staff filters
    switch (filterType) {
      case 'skills':
        return demandData.dataPoints.filter(dp => 
          filterValue.length === 0 || filterValue.includes(dp.skillType)
        );
      case 'clients':
        return demandData.dataPoints.filter(dp => 
          filterValue.length === 0 || 
          dp.taskBreakdown?.some(task => filterValue.includes(task.clientId))
        );
      case 'time':
        // Time filtering logic
        return demandData.dataPoints.filter(dp => {
          const monthIndex = parseInt(dp.month.split('-')[1]) - 1;
          return monthIndex >= filterValue.start && monthIndex <= filterValue.end;
        });
      default:
        return demandData.dataPoints;
    }
  }, [demandData]);

  return {
    performOptimizedFilter,
    batchUpdateFilters,
    clearPerformanceCache,
    getPerformanceReport,
    performanceData,
    optimizedConfig
  };
};

// Helper functions
function getMemoryUsage(): number {
  if ('memory' in performance) {
    return (performance as any).memory.usedJSHeapSize || 0;
  }
  return 0;
}

function generatePerformanceRecommendations(
  performanceData: PerformanceTrackingData,
  cacheStats: any
): string[] {
  const recommendations: string[] = [];
  
  if (performanceData.averageFilterTime > 500) {
    recommendations.push('Consider enabling aggressive caching for better filter performance');
  }
  
  if (performanceData.cacheHitRate < 0.3) {
    recommendations.push('Low cache hit rate detected - consider adjusting cache strategy');
  }
  
  if (cacheStats.totalMemoryMB > 50) {
    recommendations.push('High memory usage detected - consider clearing cache periodically');
  }
  
  if (performanceData.totalFilterOperations > 100 && performanceData.averageFilterTime > 200) {
    recommendations.push('Enable batch updates for better performance with frequent filter changes');
  }
  
  return recommendations;
}
