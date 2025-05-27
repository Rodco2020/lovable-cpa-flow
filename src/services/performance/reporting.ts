
/**
 * Performance Report Generator
 * 
 * Generates comprehensive performance reports and recommendations
 */

import { PerformanceMetric, PerformanceReport, PerformanceAlert, PerformanceConfig } from './types';
import { PerformanceAlertManager } from './alerts';

export class PerformanceReportGenerator {
  private alertManager: PerformanceAlertManager;
  private config: PerformanceConfig;

  constructor(config: PerformanceConfig) {
    this.config = config;
    this.alertManager = new PerformanceAlertManager(config);
  }

  /**
   * Generate comprehensive performance report
   */
  generateReport(metrics: PerformanceMetric[], timeframeHours: number = 24): PerformanceReport {
    const cutoffTime = new Date(Date.now() - timeframeHours * 60 * 60 * 1000);
    const recentMetrics = metrics.filter(m => m.timestamp >= cutoffTime);

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
    const alerts = this.alertManager.generateAlerts(recentMetrics);

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
   * Generate performance recommendations
   */
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
      if (average > this.config.warningThreshold && stats.count > 5) {
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
}
