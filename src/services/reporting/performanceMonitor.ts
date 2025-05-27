
/**
 * Reporting Performance Monitor
 * 
 * Handles performance tracking and logging for reporting operations
 */

export class ReportingPerformanceMonitor {
  /**
   * Track performance of an async operation
   */
  async trackPerformance<T>(
    operationName: string,
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      
      console.log(`${operationName} completed in ${duration.toFixed(2)}ms`, metadata);
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`${operationName} failed after ${duration.toFixed(2)}ms`, error, metadata);
      throw error;
    }
  }
}

