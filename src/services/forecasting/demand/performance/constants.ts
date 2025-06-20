/**
 * Phase 4: Enhanced Performance Constants
 * 
 * Defines performance operation types and thresholds for monitoring
 */

export const PERFORMANCE_OPERATIONS = {
  // Existing operations
  FILTERING_NO_OP: 'filtering_no_op',
  FILTERING_OPTIMIZED: 'filtering_optimized',
  
  // Phase 4: New comprehensive filtering operations
  FILTERING_COMPREHENSIVE: 'filtering_comprehensive',
  FILTERING_THREE_MODE_STAFF: 'filtering_three_mode_staff',
  FILTERING_SKILL_ENHANCED: 'filtering_skill_enhanced',
  FILTERING_CLIENT_ENHANCED: 'filtering_client_enhanced',
  FILTERING_TIME_HORIZON: 'filtering_time_horizon',
  METRICS_RECALCULATION: 'metrics_recalculation',
  
  // Data processing operations
  DATA_PROCESSING_SMALL: 'data_processing_small',
  DATA_PROCESSING_CHUNKED: 'data_processing_chunked',
  MATRIX_TRANSFORMATION: 'matrix_transformation',
  
  // Memory and performance tracking
  MEMORY_USAGE_ESTIMATION: 'memory_usage_estimation',
  FILTER_VALIDATION: 'filter_validation'
} as const;

export const PERFORMANCE_THRESHOLDS = {
  // Maximum acceptable processing times (in milliseconds)
  FILTERING_MAX_TIME: 1000,
  SKILL_FILTERING_MAX_TIME: 200,
  CLIENT_FILTERING_MAX_TIME: 300,
  STAFF_FILTERING_MAX_TIME: 400,
  TIME_HORIZON_MAX_TIME: 150,
  METRICS_RECALC_MAX_TIME: 100,
  
  // Memory usage thresholds
  MAX_MEMORY_USAGE_MB: 50,
  MEMORY_WARNING_THRESHOLD: 0.8, // 80% of max
  
  // Data size thresholds
  LARGE_DATASET_THRESHOLD: 1000, // data points
  PERFORMANCE_WARNING_THRESHOLD: 500 // milliseconds
} as const;

export const PERFORMANCE_CONSTANTS = {
  // Cache management
  CACHE_SIZE_LIMIT: 100,
  MAX_PERFORMANCE_METRICS: 100,
  MAX_MEMORY_METRICS: 50,
  
  // Processing thresholds
  CHUNK_SIZE: 1000,
  PERFORMANCE_THRESHOLD_MS: 500,
  MEMORY_ALERT_THRESHOLD_MB: 10
} as const;

export const FILTER_MODE_TYPES = {
  ALL_TASKS: 'all',
  SPECIFIC_STAFF: 'specific', 
  UNASSIGNED_ONLY: 'none'
} as const;

export const LOGGING_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  PERFORMANCE: 'performance'
} as const;
