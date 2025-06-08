
/**
 * Performance Optimization Constants
 * Configuration values for performance optimization features
 */

export const PERFORMANCE_CONSTANTS = {
  CHUNK_SIZE: 100,
  CACHE_SIZE_LIMIT: 50,
  PERFORMANCE_THRESHOLD_MS: 1000,
  MEMORY_ALERT_THRESHOLD_MB: 10,
  MAX_PERFORMANCE_METRICS: 100,
  MAX_MEMORY_METRICS: 50
} as const;

export const PERFORMANCE_OPERATIONS = {
  DATA_PROCESSING_SMALL: 'data-processing-small',
  DATA_PROCESSING_CHUNKED: 'data-processing-chunked',
  FILTERING_NO_OP: 'filtering-no-op',
  FILTERING_OPTIMIZED: 'filtering-optimized',
  MATRIX_TRANSFORMATION: 'matrix-transformation'
} as const;
