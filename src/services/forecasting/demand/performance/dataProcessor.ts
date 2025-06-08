
/**
 * Data Processing Optimizer
 * Handles large dataset processing with chunking and performance monitoring
 */

import { debugLog } from '../../logger';
import { PerformanceMetric, ChunkProcessorOptions } from './types';
import { PERFORMANCE_CONSTANTS, PERFORMANCE_OPERATIONS } from './constants';
import { PerformanceMonitor } from './performanceMonitor';

export class DataProcessor {
  private static performanceMonitor = new PerformanceMonitor();

  /**
   * Optimize large dataset processing with chunking
   */
  static optimizeDataProcessing<T, R>(
    data: T[],
    processor: (chunk: T[]) => R[],
    options: ChunkProcessorOptions = {}
  ): R[] {
    const { chunkSize = PERFORMANCE_CONSTANTS.CHUNK_SIZE, enableLogging = true } = options;
    const startTime = performance.now();
    
    if (data.length <= chunkSize) {
      const result = processor(data);
      const processingTime = performance.now() - startTime;
      this.performanceMonitor.recordPerformance(
        PERFORMANCE_OPERATIONS.DATA_PROCESSING_SMALL, 
        processingTime
      );
      return result;
    }

    if (enableLogging) {
      debugLog(`Processing ${data.length} items in chunks of ${chunkSize}`);
    }
    
    const results: R[] = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      const chunkResult = processor(chunk);
      results.push(...chunkResult);
    }
    
    const processingTime = performance.now() - startTime;
    this.performanceMonitor.recordPerformance(
      PERFORMANCE_OPERATIONS.DATA_PROCESSING_CHUNKED, 
      processingTime
    );
    
    if (enableLogging) {
      debugLog(`Completed chunked processing in ${processingTime.toFixed(2)}ms`);
    }
    
    return results;
  }

  /**
   * Memory-efficient matrix transformation
   */
  static optimizeMatrixTransformation(rawData: any[]): any[] {
    const startTime = performance.now();
    
    // Monitor memory usage
    const initialMemory = this.getMemoryUsage();
    
    // Use Map for efficient lookups
    const dataMap = new Map<string, any>();
    const skillsSet = new Set<string>();
    const monthsSet = new Set<string>();
    
    // Single pass through data to build maps
    rawData.forEach(item => {
      const key = `${item.skillType}-${item.month}`;
      
      if (dataMap.has(key)) {
        // Aggregate existing entry
        const existing = dataMap.get(key)!;
        existing.demandHours += item.demandHours;
        existing.taskCount += item.taskCount;
        existing.taskBreakdown = [...(existing.taskBreakdown || []), ...(item.taskBreakdown || [])];
      } else {
        // Create new entry
        dataMap.set(key, { ...item });
        skillsSet.add(item.skillType);
        monthsSet.add(item.month);
      }
    });
    
    // Convert back to array
    const result = Array.from(dataMap.values());
    
    const transformTime = performance.now() - startTime;
    const finalMemory = this.getMemoryUsage();
    
    this.performanceMonitor.recordPerformance(PERFORMANCE_OPERATIONS.MATRIX_TRANSFORMATION, transformTime);
    this.performanceMonitor.recordMemoryUsage(finalMemory - initialMemory);
    
    debugLog(`Matrix transformation: ${transformTime.toFixed(2)}ms, memory delta: ${((finalMemory - initialMemory) / 1024 / 1024).toFixed(2)}MB`);
    
    return result;
  }

  /**
   * Get current memory usage
   */
  private static getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }
}
