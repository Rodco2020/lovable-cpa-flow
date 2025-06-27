
import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { BaseFilterStrategy } from './baseFilterStrategy';
import { PerformanceOptimizer } from '../../matrixTransformer/performanceOptimizer';

/**
 * PHASE 4: Performance Optimized Filter Strategy Base Class
 * 
 * Provides high-performance filtering capabilities with:
 * - Batch processing for large datasets
 * - Memory optimization techniques
 * - Performance monitoring and metrics
 * - Caching for repeated operations
 * - Early exit optimizations
 */
export abstract class PerformanceOptimizedFilterStrategy implements BaseFilterStrategy {
  private static performanceCache = PerformanceOptimizer.createCache<string, any>(1000, 10 * 60 * 1000); // 10min TTL
  private static readonly BATCH_SIZE = 100;
  private static readonly PERFORMANCE_THRESHOLD = 100; // 100ms

  abstract getName(): string;
  abstract getPriority(): number;
  abstract shouldApply(filters: DemandFilters): boolean;

  /**
   * High-performance filter application with optimization techniques
   */
  apply(data: DemandMatrixData, filters: DemandFilters): DemandMatrixData {
    const monitor = PerformanceOptimizer.createPerformanceMonitor(`${this.getName()}_Filter`);
    monitor.start();

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(data, filters);
      const cachedResult = PerformanceOptimizedFilterStrategy.performanceCache.get(cacheKey);
      
      if (cachedResult) {
        monitor.checkpoint('cache_hit');
        console.log(`🚀 [PERF FILTER] Cache hit for ${this.getName()}`);
        return cachedResult;
      }

      monitor.checkpoint('cache_miss');

      // Apply optimized filtering (synchronous)
      const result = this.processDataOptimized(data, filters, monitor);
      
      // Cache the result
      PerformanceOptimizedFilterStrategy.performanceCache.set(cacheKey, result);
      
      const metrics = monitor.finish();
      
      if (metrics.duration > PerformanceOptimizedFilterStrategy.PERFORMANCE_THRESHOLD) {
        console.warn(`⚠️ [PERF WARNING] ${this.getName()} took ${metrics.duration.toFixed(2)}ms (threshold: ${PerformanceOptimizedFilterStrategy.PERFORMANCE_THRESHOLD}ms)`);
      }

      return result;
    } catch (error) {
      console.error(`❌ [PERF FILTER] Error in ${this.getName()}:`, error);
      return data; // Return original data on error
    }
  }

  /**
   * Generate cache key for consistent caching
   */
  private generateCacheKey(data: DemandMatrixData, filters: DemandFilters): string {
    const dataHash = `${data.dataPoints.length}_${data.totalDemand}_${data.totalTasks}`;
    const filtersHash = JSON.stringify(this.extractRelevantFilters(filters));
    return `${this.getName()}_${dataHash}_${filtersHash}`;
  }

  /**
   * Process data with performance optimizations (now synchronous)
   */
  private processDataOptimized(
    data: DemandMatrixData,
    filters: DemandFilters,
    monitor: ReturnType<typeof PerformanceOptimizer.createPerformanceMonitor>
  ): DemandMatrixData {
    monitor.checkpoint('optimization_start');

    // Optimize data structures
    const optimizedDataPoints = PerformanceOptimizer.optimizeDataStructures(data.dataPoints);
    monitor.checkpoint('data_optimization');

    // Process in batches for large datasets (synchronous batching)
    if (optimizedDataPoints.length > PerformanceOptimizedFilterStrategy.BATCH_SIZE) {
      return this.processBatchedDataSync({
        ...data,
        dataPoints: optimizedDataPoints
      }, filters, monitor);
    }

    // Direct processing for smaller datasets
    return this.processDirectly({
      ...data,
      dataPoints: optimizedDataPoints
    }, filters, monitor);
  }

  /**
   * Process large datasets in batches synchronously
   */
  private processBatchedDataSync(
    data: DemandMatrixData,
    filters: DemandFilters,
    monitor: ReturnType<typeof PerformanceOptimizer.createPerformanceMonitor>
  ): DemandMatrixData {
    const batchSize = PerformanceOptimizedFilterStrategy.BATCH_SIZE;
    const filteredDataPoints = [];

    // Process in synchronous batches
    for (let i = 0; i < data.dataPoints.length; i += batchSize) {
      const batch = data.dataPoints.slice(i, i + batchSize);
      const filteredBatch = batch.filter(dataPoint => this.shouldIncludeDataPoint(dataPoint, filters));
      filteredDataPoints.push(...filteredBatch);
    }

    monitor.checkpoint('batch_processing');

    return this.recalculateMetrics({
      ...data,
      dataPoints: filteredDataPoints
    }, monitor);
  }

  /**
   * Direct processing for smaller datasets
   */
  private processDirectly(
    data: DemandMatrixData,
    filters: DemandFilters,
    monitor: ReturnType<typeof PerformanceOptimizer.createPerformanceMonitor>
  ): DemandMatrixData {
    const filteredDataPoints = data.dataPoints.filter(dataPoint => 
      this.shouldIncludeDataPoint(dataPoint, filters)
    );

    monitor.checkpoint('direct_processing');

    return this.recalculateMetrics({
      ...data,
      dataPoints: filteredDataPoints
    }, monitor);
  }

  /**
   * Recalculate metrics efficiently
   */
  private recalculateMetrics(
    data: DemandMatrixData,
    monitor: ReturnType<typeof PerformanceOptimizer.createPerformanceMonitor>
  ): DemandMatrixData {
    const totalDemand = data.dataPoints.reduce((sum, dp) => sum + dp.demandHours, 0);
    const totalTasks = data.dataPoints.reduce((sum, dp) => sum + dp.taskCount, 0);
    const totalClients = new Set(
      data.dataPoints.flatMap(dp => 
        dp.taskBreakdown?.map(task => task.clientId) || []
      )
    ).size;

    // Update skill summary efficiently
    const skillSummary: { [key: string]: any } = {};
    for (const dp of data.dataPoints) {
      if (!skillSummary[dp.skillType]) {
        skillSummary[dp.skillType] = {
          totalHours: 0,
          taskCount: 0,
          clientCount: 0,
          totalSuggestedRevenue: 0,
          totalExpectedLessSuggested: 0,
          averageFeeRate: 0
        };
      }
      
      skillSummary[dp.skillType].totalHours += dp.demandHours;
      skillSummary[dp.skillType].taskCount += dp.taskCount;
      skillSummary[dp.skillType].clientCount += dp.clientCount;
      
      if (dp.suggestedRevenue) {
        skillSummary[dp.skillType].totalSuggestedRevenue += dp.suggestedRevenue;
      }
      if (dp.expectedLessSuggested) {
        skillSummary[dp.skillType].totalExpectedLessSuggested += dp.expectedLessSuggested;
      }
    }

    const remainingSkills = Array.from(new Set(data.dataPoints.map(dp => dp.skillType)));

    monitor.checkpoint('metrics_recalculation');

    return {
      ...data,
      totalDemand,
      totalTasks,
      totalClients,
      skillSummary,
      skills: remainingSkills
    };
  }

  /**
   * Abstract methods to be implemented by concrete filter strategies
   */
  protected abstract shouldIncludeDataPoint(dataPoint: any, filters: DemandFilters): boolean;
  protected abstract extractRelevantFilters(filters: DemandFilters): any;

  /**
   * Get performance statistics
   */
  static getPerformanceStats(): {
    cacheStats: { size: number; hitRate: number };
    totalStrategies: number;
  } {
    return {
      cacheStats: PerformanceOptimizedFilterStrategy.performanceCache.stats(),
      totalStrategies: 0 // Will be updated by factory
    };
  }

  /**
   * Clear performance cache
   */
  static clearCache(): void {
    PerformanceOptimizedFilterStrategy.performanceCache.clear();
    console.log('🧹 [PERF FILTER] Performance cache cleared');
  }
}
