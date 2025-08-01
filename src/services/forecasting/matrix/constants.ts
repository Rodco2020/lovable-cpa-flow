
import type { MatrixErrorCode } from './types';

/**
 * Matrix Service Constants
 * Centralized configuration values
 */

export const MATRIX_CONSTANTS = {
  // Cache configuration
  CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes
  MAX_CACHE_ENTRIES: 50,
  
  // Validation thresholds
  MIN_EXPECTED_MONTHS: 1,
  MAX_EXPECTED_MONTHS: 12,
  MIN_EXPECTED_SKILLS: 1,
  
  // Performance limits
  MAX_DATA_POINTS: 1000,
  PROCESSING_TIMEOUT_MS: 30000,
  
  // Error codes
  ERROR_CODES: {
    VALIDATION_FAILED: 'MATRIX_VALIDATION_FAILED' as MatrixErrorCode,
    DATA_FETCH_FAILED: 'MATRIX_DATA_FETCH_FAILED' as MatrixErrorCode,
    CACHE_ERROR: 'MATRIX_CACHE_ERROR' as MatrixErrorCode,
    PROCESSING_TIMEOUT: 'MATRIX_PROCESSING_TIMEOUT' as MatrixErrorCode
  },
  
  // Default values
  DEFAULT_FORECAST_TYPE: 'virtual' as const,
  DEFAULT_CACHE_ENABLED: true
} as const;

export type { MatrixErrorCode };
