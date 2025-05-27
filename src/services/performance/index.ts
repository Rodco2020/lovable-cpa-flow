
/**
 * Performance Module Entry Point
 * 
 * Exports all performance monitoring functionality and creates service instance
 */

export { PerformanceTimingManager } from './timing';
export { PerformanceMetricsManager } from './metrics';
export { PerformanceAlertManager } from './alerts';
export { PerformanceReportGenerator } from './reporting';
export * from './types';

// Re-import classes for instance creation
import { PerformanceTimingManager } from './timing';
import { PerformanceMetricsManager } from './metrics';
import { PerformanceAlertManager } from './alerts';
import { PerformanceReportGenerator } from './reporting';
import { PerformanceConfig } from './types';

// Create the main performance monitoring service
export class PerformanceMonitoringService {
  private timingManager: PerformanceTimingManager;
  private metricsManager: PerformanceMetricsManager;
  private alertManager: PerformanceAlertManager;
  private reportGenerator: PerformanceReportGenerator;
  private config: PerformanceConfig;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      maxMetrics: 1000,
      slowThreshold: 1000,
      warningThreshold: 500,
      ...config
    };

    this.timingManager = new PerformanceTimingManager();
    this.metricsManager = new PerformanceMetricsManager(this.config);
    this.alertManager = new PerformanceAlertManager(this.config);
    this.reportGenerator = new PerformanceReportGenerator(this.config);
  }

  // Timing methods
  startTiming(name: string, component: string, metadata?: Record<string, any>): string {
    return this.timingManager.startTiming(name, component, metadata);
  }

  endTiming(id: string) {
    const metric = this.timingManager.endTiming(id);
    if (metric) {
      this.recordMetric(metric);
      
      // Check for slow operations
      if (metric.duration > this.config.slowThreshold) {
        this.alertManager.handleSlowOperation(metric);
      }
    }
    return metric;
  }

  async timeAsync<T>(
    name: string, 
    component: string, 
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const { result, metric } = await this.timingManager.timeAsync(name, component, operation, metadata);
    if (metric) {
      this.recordMetric(metric);
      
      if (metric.duration > this.config.slowThreshold) {
        this.alertManager.handleSlowOperation(metric);
      }
    }
    return result;
  }

  timeSync<T>(
    name: string, 
    component: string, 
    operation: () => T,
    metadata?: Record<string, any>
  ): T {
    const { result, metric } = this.timingManager.timeSync(name, component, operation, metadata);
    if (metric) {
      this.recordMetric(metric);
      
      if (metric.duration > this.config.slowThreshold) {
        this.alertManager.handleSlowOperation(metric);
      }
    }
    return result;
  }

  // Metrics methods
  recordMetric(metric: any): void {
    this.metricsManager.recordMetric(metric);
  }

  getComponentMetrics(component: string, limit?: number) {
    return this.metricsManager.getComponentMetrics(component, limit);
  }

  getSlowestOperations(limit?: number) {
    return this.metricsManager.getSlowestOperations(limit);
  }

  clearMetrics(olderThanHours?: number): number {
    return this.metricsManager.clearMetrics(olderThanHours);
  }

  exportMetrics(format?: 'json' | 'csv'): string {
    return this.metricsManager.exportMetrics(format);
  }

  // Reporting methods
  generateReport(timeframeHours?: number) {
    const metrics = this.metricsManager.getAllMetrics();
    return this.reportGenerator.generateReport(metrics, timeframeHours);
  }
}

// Export global instance for backward compatibility
export const performanceMonitoringService = new PerformanceMonitoringService();
export default performanceMonitoringService;
