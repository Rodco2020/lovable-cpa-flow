
/**
 * Legacy Export - Backward Compatibility Wrapper
 * 
 * This file maintains backward compatibility while directing to the
 * refactored modular implementation for improved maintainability.
 * 
 * The refactored version is located in the DemandMatrixControlsFixed folder
 * with focused modules for better code organization:
 * - types.ts: Type definitions and interfaces
 * - hooks/: State management and data processing hooks
 * - components/: Focused UI components
 * - DemandMatrixControlsFixedRefactored.tsx: Main component
 * 
 * FUNCTIONALITY PRESERVED:
 * - All existing UI behavior and interactions
 * - Complete filter state management
 * - Data validation and processing logic
 * - Enhanced debugging capabilities
 * - Exact same public API and prop interface
 */

// Re-export the refactored implementation
export { DemandMatrixControlsFixed as default } from './DemandMatrixControlsFixed/index';
export { DemandMatrixControlsFixed } from './DemandMatrixControlsFixed/index';

// Re-export types for external consumption
export type {
  DemandMatrixControlsFixedProps,
  FilterState,
  AvailableOptions
} from './DemandMatrixControlsFixed/types';
