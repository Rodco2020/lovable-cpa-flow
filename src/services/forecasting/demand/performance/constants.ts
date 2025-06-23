
/**
 * Performance Optimization Constants
 * Shared constants for performance optimization modules
 */

export const PERFORMANCE_CONSTANTS = {
  DEFAULT_CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  MAX_CACHE_SIZE: 100,
  DEFAULT_BATCH_SIZE: 50,
  MAX_CONCURRENT_OPERATIONS: 10,
  PERFORMANCE_THRESHOLDS: {
    FILTER_TIME_WARNING: 500, // ms
    FILTER_TIME_ERROR: 1000, // ms
    MEMORY_WARNING: 50, // MB
    MEMORY_ERROR: 100, // MB
  }
} as const;

export const CACHE_KEYS = {
  STAFF_DATA: 'staff_data',
  FILTER_RESULTS: 'filter_results',
  PERFORMANCE_METRICS: 'performance_metrics'
} as const;
