
/**
 * Preferred Staff Filter Strategy - Main Export
 * 
 * This is the main export file for the refactored preferred staff filter strategy.
 * The strategy has been refactored into focused modules for improved maintainability:
 * 
 * - types.ts: Type definitions and interfaces
 * - validationUtils.ts: Input validation and normalization
 * - dataPointProcessor.ts: Core filtering logic for data points and tasks
 * - diagnosticsUtils.ts: Diagnostic and troubleshooting utilities
 * - preferredStaffFilterStrategy.ts: Main strategy implementation
 * 
 * All existing functionality is preserved with no changes to the public API.
 */

// Re-export the main strategy class
export { PreferredStaffFilterStrategy } from './preferredStaffFilterStrategy';

// Re-export types for external use
export type {
  StaffFilterAnalysis,
  StaffFilterDiagnostics,
  FilteringPerformanceMetrics,
  DataPointFilterResult,
  TaskFilterResult
} from './types';

// Re-export utility functions for advanced usage
export {
  validateAndNormalizeFilters,
  analyzeFilterData,
  shouldProceedWithFiltering
} from './validationUtils';

export {
  processDataPoint,
  processTask,
  calculateFilteredTotals
} from './dataPointProcessor';

export {
  generateZeroResultsDiagnostics,
  logZeroResultsDiagnostics,
  generatePerformanceMetrics
} from './diagnosticsUtils';
