
/**
 * Demand Matrix Filtering Hook - Backward Compatibility Export
 * 
 * This file maintains backward compatibility by re-exporting the refactored hook.
 * All existing functionality is preserved with no changes to the public API.
 * 
 * The implementation has been moved to a modular structure under the
 * useDemandMatrixFiltering directory for improved maintainability:
 * 
 * - types.ts: Type definitions and interfaces
 * - validationUtils.ts: Month range validation and time horizon creation
 * - diagnosticsUtils.ts: Debugging and diagnostic functions
 * - dataTransformUtils.ts: Data transformation utilities
 * - useDemandMatrixFiltering.ts: Main hook implementation
 * 
 * All modules work together to provide the same functionality as the original
 * single-file implementation, but with better separation of concerns and testability.
 */

// Re-export everything from the refactored implementation
export {
  useDemandMatrixFiltering,
  useDemandMatrixFiltering as default
} from './useDemandMatrixFiltering/index';

export type {
  FilteredDataResult,
  UseDemandMatrixFilteringProps,
  UseDemandMatrixFilteringResult
} from './useDemandMatrixFiltering/types';
