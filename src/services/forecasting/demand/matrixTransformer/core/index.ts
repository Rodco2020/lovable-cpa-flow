
/**
 * Matrix Transformer Core Module Exports - Phase 4 Enhanced
 * 
 * Enhanced with advanced features for handling unassigned tasks,
 * staff information, and comprehensive error handling
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
  MatrixSummaries,
  StaffValidationResult, // Phase 4: Enhanced validation
  ProcessingError        // Phase 4: Error handling
} from './types';

export { 
  MATRIX_TRANSFORMER_CONFIG,
  RECURRENCE_MULTIPLIERS,
  MONTH_FORMAT_OPTIONS 
} from './constants';

// Phase 4: Additional utilities for advanced features
export { DemandDrillDownService } from '../../demandDrillDownService';
