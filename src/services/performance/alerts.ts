
/**
 * Performance Alert Manager
 * 
 * Handles performance alerting and suggestion generation
 */

import { PerformanceMetric, PerformanceAlert, PerformanceConfig } from './types';
import { logError } from '@/services/errorLoggingService';

export class PerformanceAlertManager {
  private config: PerformanceConfig;

  constructor(config: PerformanceConfig) {
    this.config = config;
  }

  /**
   * Handle slow operation detection
   */
  handleSlowOperation(metric: PerformanceMetric): void {
    if (metric.duration <= this.config.slowThreshold) {
      return;
    }

    const alert: PerformanceAlert = {
      type: 'slow_query',
      message: `Slow operation detected: ${metric.name} took ${metric.duration.toFixed(2)}ms`,
      severity: metric.duration > 2000 ? 'high' : 'medium',
      component: metric.component,
      suggestion: this.getSuggestionForSlowOperation(metric)
    };

    // Log the slow operation
    logError(`Slow operation detected: ${metric.name}`, 'warning', {
      component: metric.component,
      details: `${metric.duration.toFixed(2)}ms`,
      data: metric.metadata
    });

    // In a real application, this might send alerts to monitoring systems
    console.warn('Performance Alert:', alert);
  }

  /**
   * Generate performance alerts from metrics
   */
  generateAlerts(metrics: PerformanceMetric[]): PerformanceAlert[] {
    const alerts: PerformanceAlert[] = [];
    
    // Alert for excessive slow operations
    const slowOperations = metrics.filter(m => m.duration > this.config.slowThreshold);
    const slowPercentage = metrics.length > 0 ? (slowOperations.length / metrics.length) * 100 : 0;
    
    if (slowPercentage > 10 && metrics.length > 0) {
      alerts.push({
        type: 'slow_query',
        message: `${slowPercentage.toFixed(1)}% of operations are slower than ${this.config.slowThreshold}ms`,
        severity: slowPercentage > 25 ? 'high' : 'medium',
        component: 'system',
        suggestion: 'Review and optimize slow operations'
      });
    }

    return alerts;
  }

  /**
   * Get performance suggestions for slow operations
   */
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
}
