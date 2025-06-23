
/**
 * Performance Monitor
 * Monitors and tracks performance metrics
 */

import { PerformanceMetrics } from './types';

export class PerformanceMonitor {
  private startTime: number = 0;
  private checkpoints: Array<{ name: string; time: number }> = [];
  
  constructor(private operationName: string) {}
  
  /**
   * Start monitoring
   */
  start(): void {
    this.startTime = performance.now();
    this.checkpoints = [];
  }
  
  /**
   * Add checkpoint
   */
  checkpoint(name: string): void {
    this.checkpoints.push({
      name,
      time: performance.now()
    });
  }
  
  /**
   * Finish monitoring and get metrics
   */
  finish(): {
    duration: number;
    checkpoints: Array<{ name: string; duration: number }>;
    memoryUsage: { peak: number; current: number };
  } {
    const endTime = performance.now();
    const duration = endTime - this.startTime;
    
    const checkpointMetrics = this.checkpoints.map((checkpoint, index) => {
      const previousTime = index === 0 ? this.startTime : this.checkpoints[index - 1].time;
      return {
        name: checkpoint.name,
        duration: checkpoint.time - previousTime
      };
    });
    
    return {
      duration,
      checkpoints: checkpointMetrics,
      memoryUsage: this.getMemoryUsage()
    };
  }
  
  /**
   * Get memory usage information
   */
  private getMemoryUsage(): { peak: number; current: number } {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        peak: memory.usedJSHeapSize || 0,
        current: memory.usedJSHeapSize || 0
      };
    }
    return { peak: 0, current: 0 };
  }
  
  /**
   * Create performance monitor instance
   */
  static create(operationName: string): PerformanceMonitor {
    return new PerformanceMonitor(operationName);
  }
}
