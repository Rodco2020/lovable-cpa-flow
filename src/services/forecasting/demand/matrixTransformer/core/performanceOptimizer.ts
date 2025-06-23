
/**
 * Performance Optimization Utilities
 * Extracted from matrixTransformerCore.ts for better maintainability
 */

import { RecurringTaskDB } from '@/types/task';

export interface PerformanceMonitor {
  start(): void;
  checkpoint(name: string): void;
  finish(): PerformanceMetrics;
}

export interface PerformanceMetrics {
  duration: number;
  memoryUsage: {
    peak: number;
    average: number;
  };
  checkpoints: Array<{
    name: string;
    timestamp: number;
    memoryUsage: number;
  }>;
}

export class PerformanceOptimizer {
  /**
   * Helper function to get current memory usage
   */
  private static getCurrentMemoryUsage(): number {
    // In browser environment, we can use performance.memory if available
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize || 0;
    }
    return 0;
  }

  /**
   * Create a performance monitor for tracking transformation metrics
   */
  static createPerformanceMonitor(operationName: string): PerformanceMonitor {
    const checkpoints: Array<{ name: string; timestamp: number; memoryUsage: number }> = [];
    let startTime: number;
    let memoryUsages: number[] = [];

    return {
      start() {
        startTime = performance.now();
        const initialMemory = PerformanceOptimizer.getCurrentMemoryUsage();
        memoryUsages.push(initialMemory);
        checkpoints.push({
          name: 'Start',
          timestamp: startTime,
          memoryUsage: initialMemory
        });
      },

      checkpoint(name: string) {
        const currentTime = performance.now();
        const currentMemory = PerformanceOptimizer.getCurrentMemoryUsage();
        memoryUsages.push(currentMemory);
        checkpoints.push({
          name,
          timestamp: currentTime,
          memoryUsage: currentMemory
        });
      },

      finish(): PerformanceMetrics {
        const endTime = performance.now();
        const finalMemory = PerformanceOptimizer.getCurrentMemoryUsage();
        memoryUsages.push(finalMemory);
        
        checkpoints.push({
          name: 'End',
          timestamp: endTime,
          memoryUsage: finalMemory
        });

        return {
          duration: endTime - startTime,
          memoryUsage: {
            peak: Math.max(...memoryUsages),
            average: memoryUsages.reduce((sum, usage) => sum + usage, 0) / memoryUsages.length
          },
          checkpoints
        };
      }
    };
  }

  /**
   * Optimize data structures for better performance
   */
  static optimizeDataStructures<T>(data: T[]): T[] {
    // For now, just return the data as-is
    // In the future, this could implement specific optimizations
    return data;
  }
}
