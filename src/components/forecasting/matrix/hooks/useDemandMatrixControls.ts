
/**
 * Demand Matrix Controls Hook - Backward Compatibility Export
 * 
 * This file maintains backward compatibility by re-exporting the refactored hook.
 * All existing functionality is preserved with no changes to the public API.
 * 
 * The implementation has been moved to a modular structure under the
 * useDemandMatrixControls directory for improved maintainability.
 */

// Re-export everything from the refactored implementation
export {
  useDemandMatrixControls,
  useDemandMatrixControls as default
} from './useDemandMatrixControls/index';

export type {
  DemandMatrixControlsState,
  UseDemandMatrixControlsProps,
  UseDemandMatrixControlsResult
} from './useDemandMatrixControls/types';
