/**
 * Performance Monitoring
 * Handles performance metrics collection and analysis
 */

import { PerformanceMetric, MemoryUsageMetric, PerformanceStats } from './types';
import { PERFORMANCE_CONSTANTS } from './constants';
import { debugLog } from '../../logger';

export class PerformanceMonitor {
  private static performanceMetrics: Map<string, number[]> = new Map();
  private static memoryUsageLog: number[] = [];

  /**
   * Record performance metrics
   */
  recordPerformance(operation: string, timeMs: number): void {
    if (!PerformanceMonitor.performanceMetrics.has(operation)) {
      PerformanceMonitor.performanceMetrics.set(operation, []);
    }
    
    const metrics = PerformanceMonitor.performanceMetrics.get(operation)!;
    metrics.push(timeMs);
    
    // Keep only last 100 measurements
    if (metrics.length > PERFORMANCE_CONSTANTS.MAX_PERFORMANCE_METRICS) {
      metrics.shift();
    }
    
    // Alert on slow operations
    if (timeMs > PERFORMANCE_CONSTANTS.PERFORMANCE_THRESHOLD_MS) {
      console.warn(`⚠️ Slow operation detected: ${operation} took ${timeMs.toFixed(2)}ms`);
    }
  }

  /**
   * Record memory usage
   */
  recordMemoryUsage(deltaBytes: number): void {
    PerformanceMonitor.memoryUsageLog.push(deltaBytes);
    
    // Keep only last 50 measurements
    if (PerformanceMonitor.memoryUsageLog.length > PERFORMANCE_CONSTANTS.MAX_MEMORY_METRICS) {
      PerformanceMonitor.memoryUsageLog.shift();
    }
    
    // Alert on high memory usage (10MB delta)
    const alertThresholdBytes = PERFORMANCE_CONSTANTS.MEMORY_ALERT_THRESHOLD_MB * 1024 * 1024;
    if (Math.abs(deltaBytes) > alertThresholdBytes) {
      console.warn(`⚠️ High memory usage: ${(deltaBytes / 1024 / 1024).toFixed(2)}MB delta`);
    }
  }

  /**
   * Get performance statistics
   */
  static getPerformanceStats(): PerformanceStats {
    const stats: PerformanceStats = {} as PerformanceStats;
    
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
   * Clear performance data (for cleanup)
   */
  static clearPerformanceData(): void {
    this.performanceMetrics.clear();
    this.memoryUsageLog.length = 0;
    debugLog('Performance monitoring data cleared');
  }
}
