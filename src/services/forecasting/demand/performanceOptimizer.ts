
/**
 * Legacy Performance Optimizer - Refactored
 * 
 * This file maintains backward compatibility while delegating to the new modular performance system.
 * All functionality remains exactly the same, but the code is now better organized.
 */

import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { debugLog } from '../logger';
import { 
  DataProcessor, 
  DataFilter, 
  CacheManager, 
  PerformanceMonitor,
  PerformanceStats 
} from './performance';

/**
 * Performance Optimizer for Demand Matrix
 * Handles large datasets, caching, and performance monitoring
 * 
 * @deprecated Use the individual classes from './performance' for new code
 */
export class DemandPerformanceOptimizer {
  // Re-export constants for backward compatibility
  private static readonly CHUNK_SIZE = 100;
  private static readonly CACHE_SIZE_LIMIT = 50;
  private static readonly PERFORMANCE_THRESHOLD_MS = 1000;

  /**
   * Optimize large dataset processing with chunking
   * @deprecated Use DataProcessor.optimizeDataProcessing instead
   */
  static optimizeDataProcessing<T, R>(
    data: T[],
    processor: (chunk: T[]) => R[],
    chunkSize: number = this.CHUNK_SIZE
  ): R[] {
    return DataProcessor.optimizeDataProcessing(data, processor, { chunkSize });
  }

  /**
   * Efficient data filtering with early exit conditions
   * @deprecated Use DataFilter.optimizeFiltering instead
   */
  static optimizeFiltering(
    data: DemandMatrixData,
    filters: DemandFilters
  ): DemandMatrixData {
    return DataFilter.optimizeFiltering(data, filters);
  }

  /**
   * Memory-efficient matrix transformation
   * @deprecated Use DataProcessor.optimizeMatrixTransformation instead
   */
  static optimizeMatrixTransformation(rawData: any[]): any[] {
    return DataProcessor.optimizeMatrixTransformation(rawData);
  }

  /**
   * Intelligent cache management with LRU eviction
   * @deprecated Use CacheManager.manageCacheSize instead
   */
  static manageCacheSize<T>(cache: Map<string, T>, maxSize: number = this.CACHE_SIZE_LIMIT): void {
    CacheManager.manageCacheSize(cache, { maxSize });
  }

  /**
   * Performance monitoring and alerts
   * @deprecated Use PerformanceMonitor.recordPerformance instead
   */
  static recordPerformance(operation: string, timeMs: number): void {
    const monitor = new PerformanceMonitor();
    monitor.recordPerformance(operation, timeMs);
  }

  /**
   * Memory usage tracking
   * @deprecated Use PerformanceMonitor.recordMemoryUsage instead
   */
  static recordMemoryUsage(deltaBytes: number): void {
    const monitor = new PerformanceMonitor();
    monitor.recordMemoryUsage(deltaBytes);
  }

  /**
   * Get performance statistics
   * @deprecated Use PerformanceMonitor.getPerformanceStats instead
   */
  static getPerformanceStats(): PerformanceStats {
    return PerformanceMonitor.getPerformanceStats();
  }

  /**
   * Clear performance data (for cleanup)
   * @deprecated Use PerformanceMonitor.clearPerformanceData instead
   */
  static clearPerformanceData(): void {
    PerformanceMonitor.clearPerformanceData();
  }
}
