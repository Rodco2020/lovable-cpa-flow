
/**
 * Performance Optimization Types
 * Core type definitions for demand matrix performance optimization
 */

import { DemandMatrixData, DemandFilters } from '@/types/demand';

export interface PerformanceMetric {
  operation: string;
  timeMs: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface MemoryUsageMetric {
  deltaBytes: number;
  timestamp: Date;
  operation?: string;
}

export interface PerformanceStats {
  operations: {
    [operation: string]: {
      average: string;
      max: string;
      min: string;
      samples: number;
    };
  };
  memory: {
    totalDelta: string;
    averageDelta: string;
    samples: number;
  };
}

export interface ChunkProcessorOptions {
  chunkSize?: number;
  enableLogging?: boolean;
}

export interface FilteringOptions {
  enableEarlyExit?: boolean;
  enablePreCalculation?: boolean;
  enableLogging?: boolean;
}

export interface CacheManagementOptions {
  maxSize?: number;
  enableLogging?: boolean;
}
