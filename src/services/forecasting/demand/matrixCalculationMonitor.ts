
/**
 * Matrix Calculation Performance Monitor
 * 
 * This service monitors the performance of matrix calculations and provides
 * insights into system efficiency and potential bottlenecks.
 */

interface PerformanceMetric {
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface PerformanceReport {
  totalOperations: number;
  averageDuration: number;
  slowestOperation: PerformanceMetric | null;
  fastestOperation: PerformanceMetric | null;
  operationBreakdown: Record<string, {
    count: number;
    totalDuration: number;
    averageDuration: number;
  }>;
  memoryUsage?: {
    initial: number;
    peak: number;
    final: number;
  };
}

export class MatrixCalculationMonitor {
  private static metrics: PerformanceMetric[] = [];
  private static isMonitoring = false;

  /**
   * Start monitoring performance
   */
  static startMonitoring(): void {
    this.isMonitoring = true;
    this.metrics = [];
    console.log('📊 [MATRIX MONITOR] Performance monitoring started');
  }

  /**
   * Stop monitoring and generate report
   */
  static stopMonitoring(): PerformanceReport {
    this.isMonitoring = false;
    const report = this.generateReport();
    console.log('📊 [MATRIX MONITOR] Performance monitoring stopped:', report);
    return report;
  }

  /**
   * Start timing an operation
   */
  static startOperation(operation: string, metadata?: Record<string, any>): string {
    if (!this.isMonitoring) return '';
    
    const operationId = `${operation}-${Date.now()}-${Math.random()}`;
    
    this.metrics.push({
      operation,
      startTime: performance.now(),
      metadata
    });
    
    return operationId;
  }

  /**
   * End timing an operation
   */
  static endOperation(operation: string, metadata?: Record<string, any>): void {
    if (!this.isMonitoring) return;
    
    const endTime = performance.now();
    const metric = this.metrics
      .reverse()
      .find(m => m.operation === operation && !m.endTime);
    
    if (metric) {
      metric.endTime = endTime;
      metric.duration = endTime - metric.startTime;
      if (metadata) {
        metric.metadata = { ...(metric.metadata || {}), ...metadata };
      }
    }
    
    // Reverse back to original order
    this.metrics.reverse();
  }

  /**
   * Log a performance warning
   */
  static logPerformanceWarning(operation: string, duration: number, threshold: number): void {
    if (duration > threshold) {
      console.warn(`⚠️ [MATRIX MONITOR] Performance warning for ${operation}:`, {
        duration: `${duration.toFixed(2)}ms`,
        threshold: `${threshold}ms`,
        exceedsBy: `${(duration - threshold).toFixed(2)}ms`
      });
    }
  }

  /**
   * Monitor skill calculation performance
   */
  static async monitorSkillCalculation<T>(
    operation: string,
    calculationFn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const operationId = this.startOperation(`skill-calc-${operation}`, metadata);
    
    try {
      const result = await calculationFn();
      this.endOperation(`skill-calc-${operation}`,
        { ...metadata, success: true, resultCount: Array.isArray(result) ? result.length : 'N/A' }
      );
      return result;
    } catch (error) {
      this.endOperation(`skill-calc-${operation}`, 
        { ...metadata, success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      );
      throw error;
    }
  }

  /**
   * Monitor matrix rendering performance
   */
  static monitorMatrixRender<T>(
    operation: string,
    renderFn: () => T,
    metadata?: Record<string, any>
  ): T {
    const operationId = this.startOperation(`matrix-render-${operation}`, metadata);
    
    try {
      const result = renderFn();
      this.endOperation(`matrix-render-${operation}`, { ...metadata, success: true });
      return result;
    } catch (error) {
      this.endOperation(`matrix-render-${operation}`, 
        { ...metadata, success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      );
      throw error;
    }
  }

  /**
   * Generate performance report
   */
  private static generateReport(): PerformanceReport {
    const completedMetrics = this.metrics.filter(m => m.duration !== undefined);
    
    if (completedMetrics.length === 0) {
      return {
        totalOperations: 0,
        averageDuration: 0,
        slowestOperation: null,
        fastestOperation: null,
        operationBreakdown: {}
      };
    }

    const durations = completedMetrics.map(m => m.duration!);
    const averageDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    
    const slowestOperation = completedMetrics.reduce((prev, current) => 
      (current.duration! > prev.duration!) ? current : prev
    );
    
    const fastestOperation = completedMetrics.reduce((prev, current) => 
      (current.duration! < prev.duration!) ? current : prev
    );

    // Generate operation breakdown
    const operationBreakdown: Record<string, { count: number; totalDuration: number; averageDuration: number }> = {};
    
    completedMetrics.forEach(metric => {
      if (!operationBreakdown[metric.operation]) {
        operationBreakdown[metric.operation] = {
          count: 0,
          totalDuration: 0,
          averageDuration: 0
        };
      }
      
      operationBreakdown[metric.operation].count++;
      operationBreakdown[metric.operation].totalDuration += metric.duration!;
      operationBreakdown[metric.operation].averageDuration = 
        operationBreakdown[metric.operation].totalDuration / operationBreakdown[metric.operation].count;
    });

    return {
      totalOperations: completedMetrics.length,
      averageDuration,
      slowestOperation,
      fastestOperation,
      operationBreakdown
    };
  }

  /**
   * Clear all metrics
   */
  static clearMetrics(): void {
    this.metrics = [];
    console.log('📊 [MATRIX MONITOR] Metrics cleared');
  }

  /**
   * Get current metrics
   */
  static getCurrentMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Check if monitoring is active
   */
  static isMonitoringActive(): boolean {
    return this.isMonitoring;
  }
}
