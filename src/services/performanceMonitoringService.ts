import { logError } from '@/services/errorLoggingService';

/**
 * Performance Monitoring Service
 * 
 * Tracks application performance, database query times,
 * and provides optimization recommendations
 */

export interface PerformanceMetric {
  id: string;
  name: string;
  duration: number;
  timestamp: Date;
  component: string;
  metadata?: Record<string, any>;
}

export interface PerformanceReport {
  summary: {
    averageResponseTime: number;
    slowestOperations: PerformanceMetric[];
    fastestOperations: PerformanceMetric[];
    totalOperations: number;
  };
  recommendations: string[];
  alerts: PerformanceAlert[];
}

export interface PerformanceAlert {
  type: 'slow_query' | 'memory_usage' | 'frequent_errors' | 'cache_miss';
  message: string;
  severity: 'low' | 'medium' | 'high';
  component: string;
  suggestion: string;
}

class PerformanceMonitoringService {
  private metrics: PerformanceMetric[] = [];
  private readonly MAX_METRICS = 1000; // Keep last 1000 metrics
  private readonly SLOW_THRESHOLD = 1000; // 1 second
  private readonly WARNING_THRESHOLD = 500; // 500ms
  
  /**
   * Start performance timing for an operation
   */
  startTiming(name: string, component: string, metadata?: Record<string, any>): string {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Store start time in a temporary map for completion
    if (!this.startTimes) {
      this.startTimes = new Map();
    }
    
    this.startTimes.set(id, {
      name,
      component,
      startTime: performance.now(),
      metadata
    });
    
    return id;
  }

  private startTimes = new Map<string, {
    name: string;
    component: string;
    startTime: number;
    metadata?: Record<string, any>;
  }>();

  /**
   * End performance timing and record metric
   */
  endTiming(id: string): PerformanceMetric | null {
    const startData = this.startTimes.get(id);
    if (!startData) {
      console.warn(`No start time found for timing ID: ${id}`);
      return null;
    }

    const duration = performance.now() - startData.startTime;
    const metric: PerformanceMetric = {
      id,
      name: startData.name,
      duration,
      timestamp: new Date(),
      component: startData.component,
      metadata: startData.metadata
    };

    this.recordMetric(metric);
    this.startTimes.delete(id);

    // Log slow operations
    if (duration > this.SLOW_THRESHOLD) {
      logError(`Slow operation detected: ${startData.name}`, 'warning', {
        component: startData.component,
        duration: `${duration.toFixed(2)}ms`,
        metadata: startData.metadata
      });
    }

    return metric;
  }

  /**
   * Record a performance metric directly
   */
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only recent metrics to prevent memory bloat
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }

    // Real-time alerting for critical performance issues
    if (metric.duration > this.SLOW_THRESHOLD) {
      this.handleSlowOperation(metric);
    }
  }

  /**
   * Convenient wrapper for timing async operations
   */
  async timeAsync<T>(
    name: string, 
    component: string, 
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const timingId = this.startTiming(name, component, metadata);
    
    try {
      const result = await operation();
      this.endTiming(timingId);
      return result;
    } catch (error) {
      this.endTiming(timingId);
      throw error;
    }
  }

  /**
   * Time synchronous operations
   */
  timeSync<T>(
    name: string, 
    component: string, 
    operation: () => T,
    metadata?: Record<string, any>
  ): T {
    const timingId = this.startTiming(name, component, metadata);
    
    try {
      const result = operation();
      this.endTiming(timingId);
      return result;
    } catch (error) {
      this.endTiming(timingId);
      throw error;
    }
  }

  /**
   * Generate comprehensive performance report
   */
  generateReport(timeframeHours: number = 24): PerformanceReport {
    const cutoffTime = new Date(Date.now() - timeframeHours * 60 * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp >= cutoffTime);

    if (recentMetrics.length === 0) {
      return {
        summary: {
          averageResponseTime: 0,
          slowestOperations: [],
          fastestOperations: [],
          totalOperations: 0
        },
        recommendations: ['No performance data available for the selected timeframe'],
        alerts: []
      };
    }

    const totalDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0);
    const averageResponseTime = totalDuration / recentMetrics.length;

    const sortedByDuration = [...recentMetrics].sort((a, b) => b.duration - a.duration);
    const slowestOperations = sortedByDuration.slice(0, 10);
    const fastestOperations = sortedByDuration.slice(-10).reverse();

    const recommendations = this.generateRecommendations(recentMetrics);
    const alerts = this.generateAlerts(recentMetrics);

    return {
      summary: {
        averageResponseTime,
        slowestOperations,
        fastestOperations,
        totalOperations: recentMetrics.length
      },
      recommendations,
      alerts
    };
  }

  /**
   * Get metrics for a specific component
   */
  getComponentMetrics(component: string, limit: number = 50): PerformanceMetric[] {
    return this.metrics
      .filter(m => m.component === component)
      .slice(-limit);
  }

  /**
   * Get slowest operations across all components
   */
  getSlowestOperations(limit: number = 10): PerformanceMetric[] {
    return [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  /**
   * Clear old metrics (useful for memory management)
   */
  clearMetrics(olderThanHours: number = 24): number {
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    const initialLength = this.metrics.length;
    
    this.metrics = this.metrics.filter(m => m.timestamp >= cutoffTime);
    
    const clearedCount = initialLength - this.metrics.length;
    console.log(`Cleared ${clearedCount} old performance metrics`);
    
    return clearedCount;
  }

  private handleSlowOperation(metric: PerformanceMetric): void {
    const alert: PerformanceAlert = {
      type: 'slow_query',
      message: `Slow operation detected: ${metric.name} took ${metric.duration.toFixed(2)}ms`,
      severity: metric.duration > 2000 ? 'high' : 'medium',
      component: metric.component,
      suggestion: this.getSuggestionForSlowOperation(metric)
    };

    // In a real application, this might send alerts to monitoring systems
    console.warn('Performance Alert:', alert);
  }

  private getSuggestionForSlowOperation(metric: PerformanceMetric): string {
    if (metric.name.includes('database') || metric.name.includes('query')) {
      return 'Consider adding database indexes or optimizing the query';
    }
    
    if (metric.name.includes('report') || metric.name.includes('calculation')) {
      return 'Consider implementing caching for this calculation';
    }
    
    if (metric.name.includes('render') || metric.name.includes('ui')) {
      return 'Consider code splitting or lazy loading for this component';
    }
    
    return 'Consider optimization or caching for this operation';
  }

  private generateRecommendations(metrics: PerformanceMetric[]): string[] {
    const recommendations: string[] = [];
    
    // Check for consistently slow operations
    const operationAverages = new Map<string, { total: number; count: number }>();
    
    metrics.forEach(metric => {
      const key = `${metric.component}:${metric.name}`;
      const existing = operationAverages.get(key) || { total: 0, count: 0 };
      operationAverages.set(key, {
        total: existing.total + metric.duration,
        count: existing.count + 1
      });
    });

    operationAverages.forEach((stats, operation) => {
      const average = stats.total / stats.count;
      if (average > this.WARNING_THRESHOLD && stats.count > 5) {
        recommendations.push(
          `Consider optimizing "${operation}" - average response time is ${average.toFixed(2)}ms`
        );
      }
    });

    // Check for high frequency operations
    const highFrequencyOps = Array.from(operationAverages.entries())
      .filter(([_, stats]) => stats.count > 100)
      .map(([operation]) => operation);

    if (highFrequencyOps.length > 0) {
      recommendations.push(
        'Consider caching for high-frequency operations: ' + highFrequencyOps.join(', ')
      );
    }

    return recommendations;
  }

  private generateAlerts(metrics: PerformanceMetric[]): PerformanceAlert[] {
    const alerts: PerformanceAlert[] = [];
    
    // Alert for excessive slow operations
    const slowOperations = metrics.filter(m => m.duration > this.SLOW_THRESHOLD);
    const slowPercentage = (slowOperations.length / metrics.length) * 100;
    
    if (slowPercentage > 10) {
      alerts.push({
        type: 'slow_query',
        message: `${slowPercentage.toFixed(1)}% of operations are slower than ${this.SLOW_THRESHOLD}ms`,
        severity: slowPercentage > 25 ? 'high' : 'medium',
        component: 'system',
        suggestion: 'Review and optimize slow operations'
      });
    }

    return alerts;
  }

  /**
   * Export metrics for external analysis
   */
  exportMetrics(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['timestamp', 'component', 'name', 'duration', 'metadata'];
      const rows = this.metrics.map(m => [
        m.timestamp.toISOString(),
        m.component,
        m.name,
        m.duration.toString(),
        JSON.stringify(m.metadata || {})
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    return JSON.stringify(this.metrics, null, 2);
  }
}

export const performanceMonitoringService = new PerformanceMonitoringService();
export default performanceMonitoringService;
