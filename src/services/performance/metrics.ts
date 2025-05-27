/**
 * Performance Metrics Storage and Management
 * 
 * Handles storage, retrieval, and analysis of performance metrics
 */

import { PerformanceMetric, PerformanceConfig } from './types';

export class PerformanceMetricsManager {
  private metrics: PerformanceMetric[] = [];
  private config: PerformanceConfig;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      maxMetrics: 1000,
      slowThreshold: 1000,
      warningThreshold: 500,
      ...config
    };
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only recent metrics to prevent memory bloat
    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics.shift();
    }
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
   * Get metrics within a timeframe
   */
  getMetricsInTimeframe(timeframeHours: number): PerformanceMetric[] {
    const cutoffTime = new Date(Date.now() - timeframeHours * 60 * 60 * 1000);
    return this.metrics.filter(m => m.timestamp >= cutoffTime);
  }

  /**
   * Clear old metrics
   */
  clearMetrics(olderThanHours: number = 24): number {
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    const initialLength = this.metrics.length;
    
    this.metrics = this.metrics.filter(m => m.timestamp >= cutoffTime);
    
    const clearedCount = initialLength - this.metrics.length;
    if (clearedCount > 0) {
      console.log(`Cleared ${clearedCount} old performance metrics`);
    }
    
    return clearedCount;
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

  /**
   * Get all metrics
   */
  getAllMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics count
   */
  getMetricsCount(): number {
    return this.metrics.length;
  }

  /**
   * Get configuration
   */
  getConfig(): PerformanceConfig {
    return { ...this.config };
  }
}
