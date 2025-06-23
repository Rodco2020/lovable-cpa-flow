
/**
 * Matrix Transformer Core Module Exports - Enhanced with Refactored Services
 * 
 * Enhanced with focused services for better maintainability and separation of concerns
 */

export { MatrixTransformerCore } from './matrixTransformerCore';
export { DataExtractors } from './dataExtractors';
export { CalculationEngine } from './calculationEngine';
export { SummaryBuilders } from './summaryBuilders';
export { DataPointBuilder } from './dataPointBuilder';
export { RevenueEnhancer } from './revenueEnhancer';
export { MatrixValidator } from './matrixValidator';

// Export refactored services
export { PerformanceOptimizer } from './performanceOptimizer';
export { ValidationService } from './validationService';
export { RevenueCalculatorService } from './revenueCalculatorService';
export { MatrixAssemblerService } from './matrixAssemblerService';
export { LoggingService } from './loggingService';

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
  StaffValidationResult,
  ProcessingError
} from './types';

export { 
  MATRIX_TRANSFORMER_CONFIG,
  RECURRENCE_MULTIPLIERS,
  MONTH_FORMAT_OPTIONS 
} from './constants';

// Additional utilities for advanced features
export { DemandDrillDownService } from '../../demandDrillDownService';
