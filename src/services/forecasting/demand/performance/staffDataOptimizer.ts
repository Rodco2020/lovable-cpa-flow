
/**
 * Staff Data Performance Optimizer
 * Enhanced with CrossFilterIntegrationTester integration
 */

import { StaffFilterOption } from '@/types/demand';
import { CrossFilterIntegrationTester } from './crossFilterIntegrationTester';
import { CacheManager } from './cacheManager';
import { PerformanceMonitor } from './performanceMonitor';
import { CACHE_KEYS } from './constants';

export interface StaffDataCache {
  data: StaffFilterOption[];
  timestamp: number;
  expiryMs: number;
}

export interface PerformanceMetrics {
  fetchTime: number;
  cacheHit: boolean;
  dataSize: number;
  filterTime?: number;
}

export class StaffDataOptimizer {
  private static readonly DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  /**
   * Optimized staff data fetching with intelligent caching
   * Now delegates to CrossFilterIntegrationTester for consistency
   */
  static async fetchStaffDataOptimized(
    forceRefresh = false,
    cacheKey = 'default'
  ): Promise<{ data: StaffFilterOption[]; metrics: PerformanceMetrics }> {
    const monitor = PerformanceMonitor.create('Staff Data Optimization');
    monitor.start();
    
    try {
      // Delegate to CrossFilterIntegrationTester for consistency
      const result = await CrossFilterIntegrationTester.fetchStaffForDropdown();
      
      const metrics = monitor.finish();
      
      return {
        data: result.data,
        metrics: {
          fetchTime: metrics.duration,
          cacheHit: result.metrics.cacheHit,
          dataSize: result.data.length
        }
      };
      
    } catch (error) {
      console.error('Error in staff data optimization:', error);
      const metrics = monitor.finish();
      
      return {
        data: [],
        metrics: {
          fetchTime: metrics.duration,
          cacheHit: false,
          dataSize: 0
        }
      };
    }
  }
  
  /**
   * Optimized staff filtering with performance tracking
   */
  static filterStaffOptimized(
    allStaff: StaffFilterOption[],
    selectedStaffIds: string[]
  ): { filtered: StaffFilterOption[]; metrics: PerformanceMetrics } {
    const startTime = performance.now();
    
    // Early return for performance
    if (selectedStaffIds.length === 0) {
      return {
        filtered: allStaff,
        metrics: {
          fetchTime: 0,
          cacheHit: true,
          dataSize: allStaff.length,
          filterTime: performance.now() - startTime
        }
      };
    }
    
    // Use Set for O(1) lookup performance
    const selectedSet = new Set(selectedStaffIds);
    const filtered = allStaff.filter(staff => selectedSet.has(staff.id));
    
    const filterTime = performance.now() - startTime;
    
    return {
      filtered,
      metrics: {
        fetchTime: 0,
        cacheHit: true,
        dataSize: filtered.length,
        filterTime
      }
    };
  }
  
  /**
   * Batch optimize multiple staff operations
   */
  static async batchOptimizeStaffOperations(
    operations: Array<{
      type: 'fetch' | 'filter';
      params: any;
    }>
  ): Promise<PerformanceMetrics[]> {
    const results: PerformanceMetrics[] = [];
    
    for (const operation of operations) {
      const startTime = performance.now();
      
      try {
        if (operation.type === 'fetch') {
          const { metrics } = await this.fetchStaffDataOptimized(
            operation.params.forceRefresh,
            operation.params.cacheKey
          );
          results.push(metrics);
        } else if (operation.type === 'filter') {
          const { metrics } = this.filterStaffOptimized(
            operation.params.allStaff,
            operation.params.selectedIds
          );
          results.push(metrics);
        }
      } catch (error) {
        results.push({
          fetchTime: performance.now() - startTime,
          cacheHit: false,
          dataSize: 0
        });
      }
    }
    
    return results;
  }
  
  /**
   * Clear cache for memory management
   */
  static clearCache(cacheKey?: string): void {
    if (cacheKey) {
      CacheManager.delete(`${CACHE_KEYS.STAFF_DATA}_${cacheKey}`);
    } else {
      CacheManager.clear();
    }
  }
  
  /**
   * Get cache statistics for monitoring
   */
  static getCacheStats(): {
    totalEntries: number;
    totalMemoryMB: number;
    oldestEntry: number;
  } {
    return CacheManager.getStats();
  }
}
