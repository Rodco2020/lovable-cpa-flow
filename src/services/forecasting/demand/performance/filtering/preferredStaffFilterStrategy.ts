
/**
 * Preferred Staff Filter Strategy - Backward Compatibility Export
 * 
 * This file maintains backward compatibility by re-exporting the refactored strategy.
 * All existing functionality is preserved with no changes to the public API.
 * 
 * The implementation has been moved to a modular structure under the
 * preferredStaffFilterStrategy directory for improved maintainability:
 * 
 * - types.ts: Type definitions and interfaces
 * - validationUtils.ts: Input validation and normalization utilities
 * - dataPointProcessor.ts: Core filtering logic for data points and tasks
 * - diagnosticsUtils.ts: Diagnostic and troubleshooting utilities
 * - preferredStaffFilterStrategy.ts: Main strategy implementation
 * 
 * All modules work together to provide the same functionality as the original
 * 262-line implementation, but with better separation of concerns and testability.
 */

// Re-export everything from the refactored implementation
export {
  PreferredStaffFilterStrategy,
  PreferredStaffFilterStrategy as default
} from './preferredStaffFilterStrategy/index';

export type {
  StaffFilterAnalysis,
  StaffFilterDiagnostics,
  FilteringPerformanceMetrics,
  DataPointFilterResult,
  TaskFilterResult
} from './preferredStaffFilterStrategy/types';
