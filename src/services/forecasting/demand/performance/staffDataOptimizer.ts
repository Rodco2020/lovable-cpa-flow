
/**
 * Staff Data Performance Optimizer
 * Optimizes staff data fetching, caching, and filtering operations
 */

import { StaffFilterOption } from '@/types/demand';

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
  private static cache = new Map<string, StaffDataCache>();
  private static readonly DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  /**
   * Optimized staff data fetching with intelligent caching
   */
  static async fetchStaffDataOptimized(
    forceRefresh = false,
    cacheKey = 'default'
  ): Promise<{ data: StaffFilterOption[]; metrics: PerformanceMetrics }> {
    const startTime = performance.now();
    
    // Check cache first
    if (!forceRefresh) {
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        const fetchTime = performance.now() - startTime;
        return {
          data: cached,
          metrics: {
            fetchTime,
            cacheHit: true,
            dataSize: cached.length
          }
        };
      }
    }
    
    try {
      // Simulate staff data fetch - replace with actual implementation
      const staffData = await this.fetchStaffFromSource();
      
      // Cache the results
      this.setCachedData(cacheKey, staffData);
      
      const fetchTime = performance.now() - startTime;
      
      return {
        data: staffData,
        metrics: {
          fetchTime,
          cacheHit: false,
          dataSize: staffData.length
        }
      };
    } catch (error) {
      console.error('Error fetching staff data:', error);
      
      // Return empty data with error metrics
      return {
        data: [],
        metrics: {
          fetchTime: performance.now() - startTime,
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
      this.cache.delete(cacheKey);
    } else {
      this.cache.clear();
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
    let totalMemory = 0;
    let oldestTimestamp = Date.now();
    
    for (const [, cacheEntry] of this.cache) {
      totalMemory += JSON.stringify(cacheEntry.data).length;
      if (cacheEntry.timestamp < oldestTimestamp) {
        oldestTimestamp = cacheEntry.timestamp;
      }
    }
    
    return {
      totalEntries: this.cache.size,
      totalMemoryMB: totalMemory / (1024 * 1024),
      oldestEntry: oldestTimestamp
    };
  }
  
  // Private helper methods
  private static getCachedData(cacheKey: string): StaffFilterOption[] | null {
    const cached = this.cache.get(cacheKey);
    
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > cached.expiryMs) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    return cached.data;
  }
  
  private static setCachedData(
    cacheKey: string,
    data: StaffFilterOption[],
    expiryMs = this.DEFAULT_CACHE_DURATION
  ): void {
    this.cache.set(cacheKey, {
      data: [...data],
      timestamp: Date.now(),
      expiryMs
    });
  }
  
  private static async fetchStaffFromSource(): Promise<StaffFilterOption[]> {
    // Mock implementation - replace with actual database call
    return [
      { id: 'staff1', name: 'John Smith' },
      { id: 'staff2', name: 'Sarah Johnson' },
      { id: 'staff3', name: 'Mike Wilson' }
    ];
  }
}
