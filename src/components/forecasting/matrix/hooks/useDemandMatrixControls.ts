
/**
 * Legacy Export - Backward Compatibility Wrapper
 * 
 * This file maintains backward compatibility while directing to the
 * refactored modular implementation for improved maintainability.
 * 
 * The refactored version is located in the useDemandMatrixControls folder
 * with focused modules for better code organization:
 * - types.ts: Type definitions
 * - stateManagement.ts: State management logic  
 * - dataProcessing.ts: Data processing and validation
 * - actionHandlers.ts: Action handlers
 * - useDemandMatrixControlsRefactored.ts: Main hook composition
 * 
 * FUNCTIONALITY PRESERVED:
 * - All existing UI behavior and interactions
 * - Complete filter state management
 * - Data fetching and processing logic
 * - Enhanced debugging capabilities
 * - Phase 2 skill resolution features
 * - Exact same public API and return interface
 */

// Re-export the refactored implementation from the correct path
export { 
  useDemandMatrixControlsRefactored as useDemandMatrixControls,
  useDemandMatrixControlsRefactored as default
} from './useDemandMatrixControls/useDemandMatrixControlsRefactored';

// Re-export types for external consumption
export type {
  UseDemandMatrixControlsProps,
  UseDemandMatrixControlsResult,
  DemandMatrixControlsState,
  AvailableOptions,
  SelectionStates,
  ControlsEventHandlers
} from './useDemandMatrixControls/types';
