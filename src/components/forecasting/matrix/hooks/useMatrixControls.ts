
/**
 * Matrix Controls Hook - Main Export
 * 
 * This is the main export file that maintains backward compatibility
 * while leveraging the new modular architecture for improved maintainability.
 * 
 * The hook has been refactored into focused modules:
 * - types.ts: Type definitions
 * - skillsSync.ts: Skills synchronization logic
 * - stateHandlers.ts: State update handlers
 * - exportUtils.ts: Export functionality
 * - useMatrixControls.ts: Main hook implementation
 * 
 * All existing functionality is preserved with no changes to the public API.
 */

// Re-export the main hook and types for backward compatibility
export { 
  useMatrixControls,
  useMatrixControls as default
} from './useMatrixControls';

export type {
  MatrixControlsState,
  UseMatrixControlsProps,
  UseMatrixControlsResult
} from './useMatrixControls/types';
