import { intelligentCache } from './intelligentCache';

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  context?: Record<string, any>;
  category: 'database' | 'computation' | 'rendering' | 'network' | 'cache';
}

interface PerformanceAlert {
  type: 'slow_query' | 'high_memory' | 'cache_miss' | 'render_time';
  message: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high';
  context?: Record<string, any>;
}

/**
 * Enhanced Performance Monitor
 * Tracks performance metrics, generates alerts, and provides optimization insights
 */
export class EnhancedPerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private alerts: PerformanceAlert[] = [];
  private maxMetrics = 1000;
  private alertThresholds = {
    slowQuery: 2000, // 2 seconds
    highMemory: 100 * 1024 * 1024, // 100MB
    cacheMissRate: 50, // 50%
    slowRender: 100 // 100ms
  };

  /**
   * Time an async operation with detailed metrics
   */
  async timeAsync<T>(
    operationName: string,
    category: PerformanceMetric['category'],
    operation: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();
    
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      
      this.recordMetric({
        name: operationName,
        duration,
        timestamp: Date.now(),
        context: {
          ...context,
          memoryDelta: this.getMemoryUsage() - startMemory,
          success: true
        },
        category
      });
      
      // Check for performance alerts
      this.checkPerformanceAlerts(operationName, duration, category);
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      this.recordMetric({
        name: operationName,
        duration,
        timestamp: Date.now(),
        context: {
          ...context,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        },
        category
      });
      
      throw error;
    }
  }

  /**
   * Time a synchronous operation
   */
  timeSync<T>(
    operationName: string,
    category: PerformanceMetric['category'],
    operation: () => T,
    context?: Record<string, any>
  ): T {
    const startTime = performance.now();
    
    try {
      const result = operation();
      const duration = performance.now() - startTime;
      
      this.recordMetric({
        name: operationName,
        duration,
        timestamp: Date.now(),
        context: { ...context, success: true },
        category
      });
      
      this.checkPerformanceAlerts(operationName, duration, category);
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      this.recordMetric({
        name: operationName,
        duration,
        timestamp: Date.now(),
        context: {
          ...context,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        },
        category
      });
      
      throw error;
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Generate performance insights and recommendations
   */
  getPerformanceInsights(): {
    slowOperations: PerformanceMetric[];
    averagesByCategory: Record<string, number>;
    recommendations: string[];
    cacheStats: any;
  } {
    const slowOperations = this.metrics.filter(m => m.duration > 1000);
    
    const averagesByCategory = this.metrics.reduce((acc, metric) => {
      if (!acc[metric.category]) {
        acc[metric.category] = { total: 0, count: 0 };
      }
      acc[metric.category].total += metric.duration;
      acc[metric.category].count++;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const categoryAverages = Object.entries(averagesByCategory).reduce((acc, [category, stats]) => {
      acc[category] = stats.total / stats.count;
      return acc;
    }, {} as Record<string, number>);

    const recommendations = this.generateRecommendations();
    const cacheStats = intelligentCache.getStats();

    return {
      slowOperations,
      averagesByCategory: categoryAverages,
      recommendations,
      cacheStats
    };
  }

  /**
   * Get current memory usage
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * Check for performance alerts
   */
  private checkPerformanceAlerts(
    operationName: string,
    duration: number,
    category: PerformanceMetric['category']
  ): void {
    // Slow operation alert
    if (duration > this.alertThresholds.slowQuery) {
      this.alerts.push({
        type: 'slow_query',
        message: `Slow operation detected: ${operationName} took ${duration.toFixed(2)}ms`,
        timestamp: Date.now(),
        severity: duration > 5000 ? 'high' : 'medium',
        context: { operationName, duration, category }
      });
    }

    // Cache performance alerts
    const cacheStats = intelligentCache.getStats();
    if (cacheStats.missRate > this.alertThresholds.cacheMissRate) {
      this.alerts.push({
        type: 'cache_miss',
        message: `High cache miss rate: ${cacheStats.missRate}%`,
        timestamp: Date.now(),
        severity: 'medium',
        context: { cacheStats }
      });
    }

    // Keep only recent alerts
    this.alerts = this.alerts.slice(-50);
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const cacheStats = intelligentCache.getStats();
    
    // Cache recommendations
    if (cacheStats.hitRate < 70) {
      recommendations.push('Consider increasing cache TTL or implementing cache warming for frequently accessed data');
    }
    
    if (cacheStats.averageAccessTime > 10) {
      recommendations.push('Cache access time is high - consider optimizing cache key structure');
    }

    // Database performance recommendations
    const dbMetrics = this.metrics.filter(m => m.category === 'database');
    const avgDbTime = dbMetrics.reduce((sum, m) => sum + m.duration, 0) / dbMetrics.length;
    
    if (avgDbTime > 1000) {
      recommendations.push('Database queries are slow - consider adding indexes or optimizing query patterns');
    }

    // Rendering performance recommendations
    const renderMetrics = this.metrics.filter(m => m.category === 'rendering');
    const avgRenderTime = renderMetrics.reduce((sum, m) => sum + m.duration, 0) / renderMetrics.length;
    
    if (avgRenderTime > 100) {
      recommendations.push('Component rendering is slow - consider memoization or virtualization for large datasets');
    }

    return recommendations;
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(limit = 10): PerformanceAlert[] {
    return this.alerts.slice(-limit);
  }

  /**
   * Clear performance data
   */
  clear(): void {
    this.metrics = [];
    this.alerts = [];
  }
}

// Global performance monitor instance
export const enhancedPerformanceMonitor = new EnhancedPerformanceMonitor();
