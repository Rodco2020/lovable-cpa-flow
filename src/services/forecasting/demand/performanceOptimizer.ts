import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { debugLog } from '../logger';

/**
 * Performance Optimizer for Demand Matrix
 * Handles large datasets, caching, and performance monitoring
 */
export class DemandPerformanceOptimizer {
  private static readonly CHUNK_SIZE = 100;
  private static readonly CACHE_SIZE_LIMIT = 50;
  private static readonly PERFORMANCE_THRESHOLD_MS = 1000;
  
  private static performanceMetrics: Map<string, number[]> = new Map();
  private static memoryUsageLog: number[] = [];

  /**
   * Optimize large dataset processing with chunking
   */
  static optimizeDataProcessing<T, R>(
    data: T[],
    processor: (chunk: T[]) => R[],
    chunkSize: number = this.CHUNK_SIZE
  ): R[] {
    const startTime = performance.now();
    
    if (data.length <= chunkSize) {
      const result = processor(data);
      this.recordPerformance('data-processing-small', performance.now() - startTime);
      return result;
    }

    debugLog(`Processing ${data.length} items in chunks of ${chunkSize}`);
    
    const results: R[] = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      const chunkResult = processor(chunk);
      results.push(...chunkResult);
      
      // Allow other tasks to run
      if (i % (chunkSize * 5) === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    const processingTime = performance.now() - startTime;
    this.recordPerformance('data-processing-chunked', processingTime);
    
    debugLog(`Completed chunked processing in ${processingTime.toFixed(2)}ms`);
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
    
    // Early exit for no filters
    if (this.hasNoActiveFilters(filters)) {
      this.recordPerformance('filtering-no-op', performance.now() - startTime);
      return data;
    }

    // Pre-calculate filter sets for efficiency
    const skillSet = new Set(filters.skills || []);
    const clientSet = new Set(filters.clients || []);
    
    // Filter data points efficiently
    const filteredDataPoints = data.dataPoints.filter(point => {
      // Skill filter
      if (skillSet.size > 0 && !skillSet.has(point.skillType)) {
        return false;
      }
      
      // Time horizon filter
      if (filters.timeHorizon) {
        const pointDate = new Date(point.month);
        if (pointDate < filters.timeHorizon.start || pointDate > filters.timeHorizon.end) {
          return false;
        }
      }
      
      // Client filter (check task breakdown)
      if (clientSet.size > 0) {
        const hasMatchingClient = point.taskBreakdown?.some(task => 
          clientSet.has(task.clientId)
        );
        if (!hasMatchingClient) {
          return false;
        }
      }
      
      return true;
    });

    // Filter skills and months based on remaining data
    const remainingSkills = new Set(filteredDataPoints.map(p => p.skillType));
    const remainingMonths = new Set(filteredDataPoints.map(p => p.month));
    
    const result = {
      ...data,
      skills: data.skills.filter(skill => remainingSkills.has(skill)),
      months: data.months.filter(month => remainingMonths.has(month.key)),
      dataPoints: filteredDataPoints,
      totalDemand: filteredDataPoints.reduce((sum, point) => sum + point.demandHours, 0),
      totalTasks: filteredDataPoints.reduce((sum, point) => sum + point.taskCount, 0),
      totalClients: new Set(
        filteredDataPoints.flatMap(point => 
          point.taskBreakdown?.map(task => task.clientId) || []
        )
      ).size
    };
    
    const filteringTime = performance.now() - startTime;
    this.recordPerformance('filtering-optimized', filteringTime);
    
    debugLog(`Optimized filtering completed in ${filteringTime.toFixed(2)}ms`);
    return result;
  }

  /**
   * Memory-efficient matrix transformation
   */
  static optimizeMatrixTransformation(rawData: any[]): any[] {
    const startTime = performance.now();
    
    // Monitor memory usage
    const initialMemory = this.getMemoryUsage();
    
    // Use Map for efficient lookups
    const dataMap = new Map<string, any>();
    const skillsSet = new Set<string>();
    const monthsSet = new Set<string>();
    
    // Single pass through data to build maps
    rawData.forEach(item => {
      const key = `${item.skillType}-${item.month}`;
      
      if (dataMap.has(key)) {
        // Aggregate existing entry
        const existing = dataMap.get(key)!;
        existing.demandHours += item.demandHours;
        existing.taskCount += item.taskCount;
        existing.taskBreakdown = [...(existing.taskBreakdown || []), ...(item.taskBreakdown || [])];
      } else {
        // Create new entry
        dataMap.set(key, { ...item });
        skillsSet.add(item.skillType);
        monthsSet.add(item.month);
      }
    });
    
    // Convert back to array
    const result = Array.from(dataMap.values());
    
    const transformTime = performance.now() - startTime;
    const finalMemory = this.getMemoryUsage();
    
    this.recordPerformance('matrix-transformation', transformTime);
    this.recordMemoryUsage(finalMemory - initialMemory);
    
    debugLog(`Matrix transformation: ${transformTime.toFixed(2)}ms, memory delta: ${((finalMemory - initialMemory) / 1024 / 1024).toFixed(2)}MB`);
    
    return result;
  }

  /**
   * Intelligent cache management with LRU eviction
   */
  static manageCacheSize<T>(cache: Map<string, T>, maxSize: number = this.CACHE_SIZE_LIMIT): void {
    if (cache.size <= maxSize) return;
    
    const entriesToRemove = cache.size - maxSize;
    const keys = Array.from(cache.keys());
    
    // Remove oldest entries (assuming insertion order)
    for (let i = 0; i < entriesToRemove; i++) {
      cache.delete(keys[i]);
    }
    
    debugLog(`Cache trimmed: removed ${entriesToRemove} entries, now ${cache.size} items`);
  }

  /**
   * Performance monitoring and alerts
   */
  static recordPerformance(operation: string, timeMs: number): void {
    if (!this.performanceMetrics.has(operation)) {
      this.performanceMetrics.set(operation, []);
    }
    
    const metrics = this.performanceMetrics.get(operation)!;
    metrics.push(timeMs);
    
    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift();
    }
    
    // Alert on slow operations
    if (timeMs > this.PERFORMANCE_THRESHOLD_MS) {
      console.warn(`⚠️ Slow operation detected: ${operation} took ${timeMs.toFixed(2)}ms`);
    }
  }

  /**
   * Memory usage tracking
   */
  static recordMemoryUsage(deltaBytes: number): void {
    this.memoryUsageLog.push(deltaBytes);
    
    // Keep only last 50 measurements
    if (this.memoryUsageLog.length > 50) {
      this.memoryUsageLog.shift();
    }
    
    // Alert on high memory usage (10MB delta)
    if (Math.abs(deltaBytes) > 10 * 1024 * 1024) {
      console.warn(`⚠️ High memory usage: ${(deltaBytes / 1024 / 1024).toFixed(2)}MB delta`);
    }
  }

  /**
   * Get performance statistics
   */
  static getPerformanceStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    this.performanceMetrics.forEach((times, operation) => {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const max = Math.max(...times);
      const min = Math.min(...times);
      
      stats[operation] = {
        average: avg.toFixed(2),
        max: max.toFixed(2),
        min: min.toFixed(2),
        samples: times.length
      };
    });
    
    const totalMemoryDelta = this.memoryUsageLog.reduce((a, b) => a + b, 0);
    stats.memory = {
      totalDelta: (totalMemoryDelta / 1024 / 1024).toFixed(2) + 'MB',
      averageDelta: (totalMemoryDelta / this.memoryUsageLog.length / 1024 / 1024).toFixed(2) + 'MB',
      samples: this.memoryUsageLog.length
    };
    
    return stats;
  }

  /**
   * Check if filters are effectively empty
   */
  private static hasNoActiveFilters(filters: DemandFilters): boolean {
    return (
      (!filters.skills || filters.skills.length === 0) &&
      (!filters.clients || filters.clients.length === 0) &&
      !filters.timeHorizon &&
      !filters.includeInactive
    );
  }

  /**
   * Get current memory usage
   */
  private static getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * Clear performance data (for cleanup)
   */
  static clearPerformanceData(): void {
    this.performanceMetrics.clear();
    this.memoryUsageLog.length = 0;
    debugLog('Performance monitoring data cleared');
  }
}
