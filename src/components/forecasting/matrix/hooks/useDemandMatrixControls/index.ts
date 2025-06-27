
/**
 * Demand Matrix Controls Hook - Main Export
 * 
 * This is the main export file that maintains backward compatibility
 * while leveraging the new modular architecture for improved maintainability.
 * 
 * The hook has been refactored into focused modules:
 * - types.ts: Type definitions
 * - stateManagement.ts: State update handlers and toggles
 * - calculations.ts: Selection state calculations
 * - initialization.ts: Hook initialization logic
 * - logging.ts: Debugging and monitoring utilities
 * - useDemandMatrixControls.ts: Main hook implementation
 * 
 * All existing functionality is preserved with no changes to the public API.
 */

// Re-export the main hook and types for backward compatibility
export { 
  useDemandMatrixControls,
  useDemandMatrixControls as default
} from './useDemandMatrixControls';

export type {
  DemandMatrixControlsState,
  UseDemandMatrixControlsProps,
  UseDemandMatrixControlsResult
} from './types';
