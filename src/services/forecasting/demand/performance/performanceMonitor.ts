
/**
 * Performance Monitor for Demand Module
 */

export class PerformanceMonitor {
  private static metrics: Array<{
    operation: string;
    duration: number;
    timestamp: number;
  }> = [];

  static time<T>(operation: string, fn: () => T): T {
    const start = Date.now();
    const result = fn();
    const duration = Date.now() - start;

    this.metrics.push({
      operation,
      duration,
      timestamp: start
    });

    return result;
  }

  static async timeAsync<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;

    this.metrics.push({
      operation,
      duration,
      timestamp: start
    });

    return result;
  }

  static getMetrics() {
    return [...this.metrics];
  }

  static clearMetrics() {
    this.metrics = [];
  }
}
