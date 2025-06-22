
/**
 * Performance Monitor for Demand Module
 */

export class PerformanceMonitor {
  private static metrics: Array<{
    operation: string;
    duration: number;
    timestamp: number;
  }> = [];

  private static memoryUsage: Array<{
    timestamp: number;
    usage: number;
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

  static recordPerformance(operation: string, duration: number): void {
    this.metrics.push({
      operation,
      duration,
      timestamp: Date.now()
    });
  }

  static recordMemoryUsage(usage: number): void {
    this.memoryUsage.push({
      timestamp: Date.now(),
      usage
    });
  }

  static getMetrics() {
    return [...this.metrics];
  }

  static getMemoryUsage() {
    return [...this.memoryUsage];
  }

  static clearMetrics() {
    this.metrics = [];
    this.memoryUsage = [];
  }
}
