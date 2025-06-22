
/**
 * Refactored Demand Matrix Controls Hook - Modular Export
 * 
 * This refactored version maintains 100% backward compatibility while
 * improving code structure through focused, single-responsibility modules:
 * 
 * - types.ts: Type definitions and interfaces
 * - stateManagement.ts: State management logic
 * - dataProcessing.ts: Data processing and validation
 * - actionHandlers.ts: Action handler logic
 * - useDemandMatrixControlsRefactored.ts: Main hook composition
 * 
 * PRESERVED FUNCTIONALITY:
 * - All existing UI behavior and interactions
 * - Complete filter state management
 * - Data fetching and processing logic
 * - Enhanced debugging capabilities
 * - Phase 2 skill resolution features
 * - Exact same public API and return interface
 */

// Export the refactored hook as the default
export { useDemandMatrixControlsRefactored as useDemandMatrixControls } from './useDemandMatrixControlsRefactored';

// Export types for external use
export type {
  UseDemandMatrixControlsProps,
  UseDemandMatrixControlsResult,
  DemandMatrixControlsState,
  AvailableOptions,
  SelectionStates,
  ControlsEventHandlers
} from './types';

// Export individual hooks for testing and advanced use cases
export { useControlsState } from './stateManagement';
export { useDataProcessing } from './dataProcessing';
export { useActionHandlers } from './actionHandlers';
