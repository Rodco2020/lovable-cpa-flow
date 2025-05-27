
/**
 * Performance Timing Manager
 * 
 * Handles performance timing operations for async and sync functions
 */

import { PerformanceMetric, TimingData } from './types';

export class PerformanceTimingManager {
  private startTimes = new Map<string, TimingData>();

  /**
   * Start performance timing for an operation
   */
  startTiming(name: string, component: string, metadata?: Record<string, any>): string {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.startTimes.set(id, {
      name,
      component,
      startTime: performance.now(),
      metadata
    });
    
    return id;
  }

  /**
   * End performance timing and create metric
   */
  endTiming(id: string): PerformanceMetric | null {
    const startData = this.startTimes.get(id);
    if (!startData) {
      console.warn(`No start time found for timing ID: ${id}`);
      return null;
    }

    const duration = performance.now() - startData.startTime;
    const metric: PerformanceMetric = {
      id,
      name: startData.name,
      duration,
      timestamp: new Date(),
      component: startData.component,
      metadata: startData.metadata
    };

    this.startTimes.delete(id);
    return metric;
  }

  /**
   * Time an async operation
   */
  async timeAsync<T>(
    name: string, 
    component: string, 
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<{ result: T; metric: PerformanceMetric | null }> {
    const timingId = this.startTiming(name, component, metadata);
    
    try {
      const result = await operation();
      const metric = this.endTiming(timingId);
      return { result, metric };
    } catch (error) {
      const metric = this.endTiming(timingId);
      throw error;
    }
  }

  /**
   * Time a synchronous operation
   */
  timeSync<T>(
    name: string, 
    component: string, 
    operation: () => T,
    metadata?: Record<string, any>
  ): { result: T; metric: PerformanceMetric | null } {
    const timingId = this.startTiming(name, component, metadata);
    
    try {
      const result = operation();
      const metric = this.endTiming(timingId);
      return { result, metric };
    } catch (error) {
      const metric = this.endTiming(timingId);
      throw error;
    }
  }

  /**
   * Clear timing data (useful for cleanup)
   */
  clearTimingData(): void {
    this.startTimes.clear();
  }

  /**
   * Get active timing count
   */
  getActiveTimingCount(): number {
    return this.startTimes.size;
  }
}
