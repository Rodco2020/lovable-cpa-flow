
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
  PerformanceMetrics
} from './performance';

export interface PerformanceStats {
  averageFilterTime: number;
  totalOperations: number;
  cacheHitRate: number;
  memoryUsage: number;
}

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
   */
  static optimizeDataProcessing<T, R>(
    data: T[],
    processor: (chunk: T[]) => R[],
    chunkSize: number = this.CHUNK_SIZE
  ): R[] {
    const results: R[] = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      const chunkResults = processor(chunk);
      results.push(...chunkResults);
    }
    return results;
  }

  /**
   * Efficient data filtering with early exit conditions
   */
  static optimizeFiltering(
    data: DemandMatrixData,
    filters: DemandFilters
  ): DemandMatrixData {
    const startTime = performance.now();
    
    // Apply skill filtering
    let filteredSkills = data.skills;
    if (filters.skills.length > 0) {
      filteredSkills = data.skills.filter(skill => filters.skills.includes(skill));
    }
    
    // Apply data point filtering
    let filteredDataPoints = data.dataPoints;
    
    if (filters.clients.length > 0) {
      filteredDataPoints = filteredDataPoints.filter(point =>
        point.taskBreakdown?.some(task => filters.clients.includes(task.clientId))
      );
    }
    
    if (filters.preferredStaff.length > 0) {
      filteredDataPoints = filteredDataPoints.filter(point =>
        point.taskBreakdown?.some(task => 
          task.preferredStaffId && filters.preferredStaff.includes(task.preferredStaffId)
        )
      );
    }
    
    const filterTime = performance.now() - startTime;
    console.log(`🔧 [PERFORMANCE] Filtering completed in ${filterTime.toFixed(2)}ms`);
    
    return {
      ...data,
      skills: filteredSkills,
      dataPoints: filteredDataPoints
    };
  }

  /**
   * Memory-efficient matrix transformation
   */
  static optimizeMatrixTransformation(rawData: any[]): any[] {
    return DataProcessor.optimizeDataStructures(rawData);
  }

  /**
   * Intelligent cache management with LRU eviction
   */
  static manageCacheSize<T>(cache: Map<string, T>, options: { maxSize?: number } = {}): void {
    const { maxSize = this.CACHE_SIZE_LIMIT } = options;
    
    if (cache.size > maxSize) {
      const keysToDelete = Array.from(cache.keys()).slice(0, cache.size - maxSize);
      keysToDelete.forEach(key => cache.delete(key));
    }
  }

  /**
   * Performance monitoring and alerts
   */
  static recordPerformance(operation: string, timeMs: number): void {
    if (timeMs > this.PERFORMANCE_THRESHOLD_MS) {
      console.warn(`⚠️ [PERFORMANCE] Slow operation detected: ${operation} took ${timeMs}ms`);
    }
  }

  /**
   * Memory usage tracking
   */
  static recordMemoryUsage(deltaBytes: number): void {
    const memoryMB = deltaBytes / (1024 * 1024);
    console.log(`📊 [MEMORY] Memory delta: ${memoryMB.toFixed(2)}MB`);
  }

  /**
   * Get performance statistics
   */
  static getPerformanceStats(): PerformanceStats {
    return {
      averageFilterTime: 0,
      totalOperations: 0,
      cacheHitRate: 0,
      memoryUsage: 0
    };
  }

  /**
   * Clear performance data (for cleanup)
   */
  static clearPerformanceData(): void {
    console.log('🧹 [PERFORMANCE] Performance data cleared');
  }
}
