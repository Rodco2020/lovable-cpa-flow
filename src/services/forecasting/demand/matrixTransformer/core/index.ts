
/**
 * Matrix Transformer Core Module Exports
 * 
 * Refactored core functionality for improved maintainability
 */

export { MatrixTransformerCore } from './matrixTransformerCore';
export { DataExtractors } from './dataExtractors';
export { CalculationEngine } from './calculationEngine';
export { SummaryBuilders } from './summaryBuilders';
export { DataPointBuilder } from './dataPointBuilder';
export { RevenueEnhancer } from './revenueEnhancer';
export { MatrixValidator } from './matrixValidator';

// Export types and constants
export type {
  MatrixTransformerConfig,
  StaffInformation,
  MonthInfo,
  ValidationResult,
  PerformanceMetrics,
  TransformationContext,
  ClientMaps,
  RevenueTotals,
  MatrixSummaries
} from './types';

export { 
  MATRIX_TRANSFORMER_CONFIG,
  RECURRENCE_MULTIPLIERS,
  MONTH_FORMAT_OPTIONS 
} from './constants';
