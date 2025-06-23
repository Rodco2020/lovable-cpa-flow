
/**
 * Data Filter
 * Optimized filtering operations with performance tracking
 */

import { PerformanceMetrics } from './types';

export class DataFilter {
  /**
   * Filter data with performance optimization
   */
  static async filterData<T>(
    data: T[],
    predicate: (item: T) => boolean | Promise<boolean>,
    options: { enableMetrics?: boolean } = {}
  ): Promise<{ filtered: T[]; metrics: PerformanceMetrics }> {
    const startTime = performance.now();
    const { enableMetrics = true } = options;
    
    // Use async filtering for better performance with large datasets
    const filtered: T[] = [];
    
    for (const item of data) {
      const shouldInclude = await predicate(item);
      if (shouldInclude) {
        filtered.push(item);
      }
    }
    
    const filterTime = performance.now() - startTime;
    
    return {
      filtered,
      metrics: {
        fetchTime: 0,
        cacheHit: false,
        dataSize: filtered.length,
        filterTime: enableMetrics ? filterTime : undefined
      }
    };
  }
  
  /**
   * Multi-criteria filtering with optimization
   */
  static async multiFilter<T>(
    data: T[],
    filters: Array<(item: T) => boolean | Promise<boolean>>
  ): Promise<{ filtered: T[]; metrics: PerformanceMetrics }> {
    const startTime = performance.now();
    
    let currentData = data;
    
    // Apply filters sequentially for optimal performance
    for (const filter of filters) {
      const { filtered } = await this.filterData(currentData, filter, { enableMetrics: false });
      currentData = filtered;
    }
    
    const filterTime = performance.now() - startTime;
    
    return {
      filtered: currentData,
      metrics: {
        fetchTime: 0,
        cacheHit: false,
        dataSize: currentData.length,
        filterTime
      }
    };
  }
}
