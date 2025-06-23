
import { MatrixTransformerConfig } from './types';

/**
 * Configuration Constants for Matrix Transformer
 */
export const MATRIX_TRANSFORMER_CONFIG: MatrixTransformerConfig = {
  DEFAULT_ESTIMATED_HOURS: 1,
  FALLBACK_FEE_RATE: 150,
  BATCH_SIZE: 50,
  CONCURRENCY_LIMIT: 5
} as const;

/**
 * Recurrence Type Mapping for Monthly Hours Calculation
 */
export const RECURRENCE_MULTIPLIERS = {
  weekly: 4.33,
  monthly: 1,
  quarterly: 1 / 3,
  annually: 1 / 12
} as const;

/**
 * Month formatting constants
 */
export const MONTH_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short'
} as const;
