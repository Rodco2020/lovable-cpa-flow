
/**
 * Performance Optimizer for Matrix Transformations
 * 
 * Provides optimization techniques for handling large datasets efficiently
 * while maintaining sub-2s processing times.
 */

export interface PerformanceMetrics {
  startTime: number;
  endTime: number;
  duration: number;
  memoryUsage: {
    start: number;
    end: number;
    peak: number;
  };
  operationCounts: {
    dataPointsProcessed: number;
    revenueCalculations: number;
    clientResolutions: number;
    skillMappings: number;
  };
}

export class PerformanceOptimizer {
  private static readonly BATCH_SIZE = 50;
  private static readonly MEMORY_THRESHOLD = 100 * 1024 * 1024; // 100MB
  private static readonly TIME_THRESHOLD = 2000; // 2 seconds

  /**
   * Process data in optimized batches
   */
  static async processBatched<T, R>(
    items: T[],
    processor: (batch: T[]) => Promise<R[]>,
    batchSize: number = this.BATCH_SIZE
  ): Promise<R[]> {
    const results: R[] = [];
    const totalBatches = Math.ceil(items.length / batchSize);
    
    console.log(`🚀 [BATCH PROCESSOR] Processing ${items.length} items in ${totalBatches} batches of ${batchSize}`);

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      
      try {
        const batchStartTime = performance.now();
        const batchResults = await processor(batch);
        const batchEndTime = performance.now();
        const batchDuration = batchEndTime - batchStartTime;
        
        results.push(...batchResults);
        
        console.log(`✅ [BATCH ${batchNumber}/${totalBatches}] Processed ${batch.length} items in ${batchDuration.toFixed(2)}ms`);
        
        // Yield control to prevent UI blocking
        if (batchDuration > 50) { // If batch took more than 50ms
          await new Promise(resolve => setTimeout(resolve, 0));
        }
        
        // Memory pressure check
        if (this.checkMemoryPressure()) {
          console.warn('⚠️ [BATCH PROCESSOR] High memory usage detected, forcing garbage collection');
          if (global.gc) {
            global.gc();
          }
        }
        
      } catch (error) {
        console.error(`❌ [BATCH ${batchNumber}/${totalBatches}] Error processing batch:`, error);
        // Continue with next batch rather than failing entirely
      }
    }

    return results;
  }

  /**
   * Optimize data structures for memory efficiency
   */
  static optimizeDataStructures<T>(data: T[]): T[] {
    if (!Array.isArray(data) || data.length === 0) {
      return data;
    }

    // Remove undefined/null entries
    const cleaned = data.filter(item => item != null);
    
    // Optimize objects by removing undefined properties
    const optimized = cleaned.map(item => {
      if (typeof item === 'object' && item !== null) {
        const optimizedItem: any = {};
        Object.keys(item as any).forEach(key => {
          const value = (item as any)[key];
          if (value !== undefined && value !== null) {
            optimizedItem[key] = value;
          }
        });
        return optimizedItem as T;
      }
      return item;
    });

    const originalSize = data.length;
    const optimizedSize = optimized.length;
    const spaceSaved = originalSize - optimizedSize;

    if (spaceSaved > 0) {
      console.log(`🗜️ [DATA OPTIMIZER] Optimized data structure: ${originalSize} → ${optimizedSize} items (${spaceSaved} items removed)`);
    }

    return optimized;
  }

  /**
   * Create performance monitor for tracking operations
   */
  static createPerformanceMonitor(operationName: string): {
    start: () => void;
    checkpoint: (label: string) => void;
    finish: () => PerformanceMetrics;
  } {
    let startTime = 0;
    let startMemory = 0;
    let peakMemory = 0;
    const checkpoints: Array<{ label: string; time: number; memory: number }> = [];
    const operationCounts = {
      dataPointsProcessed: 0,
      revenueCalculations: 0,
      clientResolutions: 0,
      skillMappings: 0
    };

    return {
      start: () => {
        startTime = performance.now();
        startMemory = this.getMemoryUsage();
        peakMemory = startMemory;
        console.log(`⏱️ [PERF MONITOR] Started: ${operationName}`);
      },

      checkpoint: (label: string) => {
        const currentTime = performance.now();
        const currentMemory = this.getMemoryUsage();
        peakMemory = Math.max(peakMemory, currentMemory);
        
        checkpoints.push({
          label,
          time: currentTime - startTime,
          memory: currentMemory
        });
        
        console.log(`⏱️ [CHECKPOINT] ${label}: ${(currentTime - startTime).toFixed(2)}ms, Memory: ${(currentMemory / 1024 / 1024).toFixed(2)}MB`);
      },

      finish: () => {
        const endTime = performance.now();
        const endMemory = this.getMemoryUsage();
        const duration = endTime - startTime;
        
        const metrics: PerformanceMetrics = {
          startTime,
          endTime,
          duration,
          memoryUsage: {
            start: startMemory,
            end: endMemory,
            peak: peakMemory
          },
          operationCounts
        };

        console.log(`✅ [PERF MONITOR] Completed: ${operationName} in ${duration.toFixed(2)}ms`);
        
        if (duration > this.TIME_THRESHOLD) {
          console.warn(`⚠️ [PERF WARNING] Operation exceeded time threshold: ${duration.toFixed(2)}ms > ${this.TIME_THRESHOLD}ms`);
        }

        return metrics;
      }
    };
  }

  /**
   * Check if processing should be throttled due to memory pressure
   */
  private static checkMemoryPressure(): boolean {
    const memoryUsage = this.getMemoryUsage();
    return memoryUsage > this.MEMORY_THRESHOLD;
  }

  /**
   * Get current memory usage (approximate)
   */
  private static getMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in window.performance) {
      return (window.performance as any).memory.usedJSHeapSize || 0;
    }
    return 0; // Fallback when memory API is not available
  }

  /**
   * Optimize async operations with concurrency control
   */
  static async processWithConcurrencyLimit<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    concurrencyLimit: number = 5
  ): Promise<R[]> {
    const results: R[] = [];
    const executing: Promise<any>[] = [];

    for (const item of items) {
      const promise = processor(item).then(result => {
        results.push(result);
        executing.splice(executing.indexOf(promise), 1);
        return result;
      });

      executing.push(promise);

      if (executing.length >= concurrencyLimit) {
        await Promise.race(executing);
      }
    }

    await Promise.all(executing);
    return results;
  }

  /**
   * Create a caching layer for expensive operations
   */
  static createCache<K, V>(
    maxSize: number = 1000,
    ttlMs: number = 5 * 60 * 1000 // 5 minutes default TTL
  ): {
    get: (key: K) => V | undefined;
    set: (key: K, value: V) => void;
    clear: () => void;
    stats: () => { size: number; hitRate: number };
  } {
    const cache = new Map<K, { value: V; timestamp: number }>();
    let hits = 0;
    let misses = 0;

    const isExpired = (timestamp: number) => {
      return Date.now() - timestamp > ttlMs;
    };

    const evictExpired = () => {
      const now = Date.now();
      for (const [key, entry] of cache.entries()) {
        if (isExpired(entry.timestamp)) {
          cache.delete(key);
        }
      }
    };

    const evictOldest = () => {
      const oldest = Array.from(cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0];
      if (oldest) {
        cache.delete(oldest[0]);
      }
    };

    return {
      get: (key: K) => {
        evictExpired();
        const entry = cache.get(key);
        
        if (entry && !isExpired(entry.timestamp)) {
          hits++;
          return entry.value;
        } else {
          misses++;
          if (entry) {
            cache.delete(key); // Remove expired entry
          }
          return undefined;
        }
      },

      set: (key: K, value: V) => {
        evictExpired();
        
        if (cache.size >= maxSize) {
          evictOldest();
        }
        
        cache.set(key, { value, timestamp: Date.now() });
      },

      clear: () => {
        cache.clear();
        hits = 0;
        misses = 0;
      },

      stats: () => ({
        size: cache.size,
        hitRate: hits + misses > 0 ? hits / (hits + misses) : 0
      })
    };
  }
}
