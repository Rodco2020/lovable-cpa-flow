
/**
 * Data Processor
 * Handles data processing operations with performance optimization
 */

import { PerformanceMetrics } from './types';
import { PERFORMANCE_CONSTANTS } from './constants';

export class DataProcessor {
  /**
   * Process data with performance monitoring
   */
  static async processData<T, R>(
    data: T[],
    processor: (item: T) => R | Promise<R>,
    options: { batchSize?: number; enableMetrics?: boolean } = {}
  ): Promise<{ results: R[]; metrics: PerformanceMetrics }> {
    const startTime = performance.now();
    const { batchSize = PERFORMANCE_CONSTANTS.DEFAULT_BATCH_SIZE, enableMetrics = true } = options;
    
    const results: R[] = [];
    
    // Process in batches for better performance
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(processor));
      results.push(...batchResults);
    }
    
    const processingTime = performance.now() - startTime;
    
    return {
      results,
      metrics: {
        fetchTime: processingTime,
        cacheHit: false,
        dataSize: results.length,
        filterTime: enableMetrics ? processingTime : undefined
      }
    };
  }
  
  /**
   * Optimize data structures for better performance
   */
  static optimizeDataStructures<T>(data: T[]): T[] {
    // Remove duplicates and optimize structure
    const seen = new Set();
    return data.filter(item => {
      const key = JSON.stringify(item);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}
