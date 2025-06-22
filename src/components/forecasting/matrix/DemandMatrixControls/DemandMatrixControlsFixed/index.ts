
/**
 * Refactored DemandMatrixControlsFixed - Export Module
 * 
 * This refactored version improves maintainability through:
 * - Focused, single-responsibility components
 * - Extracted hooks for state management
 * - Better type safety and interfaces
 * - Enhanced code organization
 * 
 * PRESERVED FUNCTIONALITY:
 * - Exact same UI appearance and behavior
 * - Identical filter logic and state management
 * - Same validation and debugging features
 * - All user interactions preserved
 */

export { DemandMatrixControlsFixedRefactored as DemandMatrixControlsFixed } from './DemandMatrixControlsFixedRefactored';
export { DemandMatrixControlsFixedRefactored as default } from './DemandMatrixControlsFixedRefactored';

// Export types for external use
export type { 
  DemandMatrixControlsFixedProps,
  FilterState,
  AvailableOptions 
} from './types';

// Export hooks for advanced use cases
export { useFilterState } from './hooks/useFilterState';
export { useAvailableOptions } from './hooks/useAvailableOptions';
