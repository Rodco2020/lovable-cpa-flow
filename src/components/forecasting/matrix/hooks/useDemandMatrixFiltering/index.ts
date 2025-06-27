
/**
 * Demand Matrix Filtering Hook - Main Export
 * 
 * This is the main export file that maintains backward compatibility
 * while leveraging the new modular architecture for improved maintainability.
 * 
 * The hook has been refactored into focused modules:
 * - types.ts: Type definitions and interfaces
 * - validationUtils.ts: Month range validation and time horizon creation
 * - diagnosticsUtils.ts: Debugging and diagnostic functions
 * - dataTransformUtils.ts: Data transformation utilities
 * - useDemandMatrixFiltering.ts: Main hook implementation
 * 
 * All existing functionality is preserved with no changes to the public API.
 */

// Re-export the main hook for backward compatibility
export { 
  useDemandMatrixFiltering,
  useDemandMatrixFiltering as default
} from './useDemandMatrixFiltering';

export type {
  FilteredDataResult,
  UseDemandMatrixFilteringProps,
  UseDemandMatrixFilteringResult
} from './types';
