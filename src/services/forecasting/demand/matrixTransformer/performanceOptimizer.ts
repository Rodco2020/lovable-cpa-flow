
/**
 * Performance Optimizer for Matrix Transformer
 * Handles performance monitoring and optimization for data processing
 */

interface PerformanceMetrics {
  duration: number;
  memoryUsage: {
    peak: number;
    current: number;
  };
  checkpoints: Array<{
    name: string;
    timestamp: number;
    duration: number;
  }>;
}

interface PerformanceMonitor {
  start(): void;
  checkpoint(name: string): void;
  finish(): PerformanceMetrics;
}

export class PerformanceOptimizer {
  /**
   * Create a performance monitor for tracking operations
   */
  static createPerformanceMonitor(operationName: string): PerformanceMonitor {
    let startTime: number;
    let lastCheckpoint: number;
    const checkpoints: Array<{ name: string; timestamp: number; duration: number }> = [];

    return {
      start() {
        startTime = performance.now();
        lastCheckpoint = startTime;
        console.log(`🚀 [PERFORMANCE] Starting ${operationName}`);
      },

      checkpoint(name: string) {
        const now = performance.now();
        const duration = now - lastCheckpoint;
        checkpoints.push({
          name,
          timestamp: now,
          duration
        });
        console.log(`⚡ [PERFORMANCE] ${name}: ${duration.toFixed(2)}ms`);
        lastCheckpoint = now;
      },

      finish() {
        const endTime = performance.now();
        const totalDuration = endTime - startTime;
        
        const metrics: PerformanceMetrics = {
          duration: totalDuration,
          memoryUsage: {
            peak: (performance as any).memory?.usedJSHeapSize || 0,
            current: (performance as any).memory?.usedJSHeapSize || 0
          },
          checkpoints
        };

        console.log(`✅ [PERFORMANCE] ${operationName} completed in ${totalDuration.toFixed(2)}ms`);
        return metrics;
      }
    };
  }

  /**
   * Optimize data structures for faster processing
   */
  static optimizeDataStructures<T>(data: T[]): T[] {
    // For now, just return the data as-is
    // This can be enhanced with actual optimization logic
    return data;
  }

  /**
   * Process data in batches to avoid blocking the main thread
   */
  static async processBatched<T, R>(
    items: T[],
    processor: (batch: T[]) => Promise<R> | R,
    batchSize: number = 10
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const result = await processor(batch);
      results.push(result);
      
      // Yield control back to the event loop
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    return results;
  }

  /**
   * Process items with concurrency limit
   */
  static async processWithConcurrencyLimit<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    concurrencyLimit: number = 5
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += concurrencyLimit) {
      const batch = items.slice(i, i + concurrencyLimit);
      const batchPromises = batch.map(item => processor(item));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  }
}
