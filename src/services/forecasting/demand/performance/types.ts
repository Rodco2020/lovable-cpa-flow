
/**
 * Performance Optimization Types
 * Common type definitions for performance optimization modules
 */

export interface PerformanceMetrics {
  fetchTime: number;
  cacheHit: boolean;
  dataSize: number;
  filterTime?: number;
  calculationTime?: number;
  renderTime?: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiryMs: number;
}

export interface FilterPerformanceConfig {
  enableCaching?: boolean;
  cacheExpiryMs?: number;
  enableMetrics?: boolean;
  maxCacheSize?: number;
}

export interface BatchOperationConfig {
  batchSize?: number;
  concurrentLimit?: number;
  enableProgressTracking?: boolean;
}

export interface LoadTestConfig {
  iterations: number;
  concurrentFilters: number;
  dataMultiplier: number;
}
