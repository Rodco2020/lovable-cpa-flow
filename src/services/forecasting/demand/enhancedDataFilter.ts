
/**
 * Enhanced Data Filter Service - Backward Compatible Export
 * 
 * This file maintains backward compatibility by re-exporting the refactored
 * EnhancedDataFilter class. All existing code will continue to work without changes.
 * 
 * The refactoring improves code structure through:
 * ✅ Modular architecture with focused responsibilities
 * ✅ Better testability with isolated services
 * ✅ Improved maintainability and code organization
 * ✅ Enhanced validation and metrics capabilities
 * ✅ Clearer separation of concerns
 * 
 * PRESERVED FUNCTIONALITY:
 * - All methods work exactly the same
 * - Same method signatures and return types
 * - Identical console logging and error handling
 * - Complete backward compatibility
 */

export { EnhancedDataFilter } from './enhancedDataFilter';

// Export additional utilities for advanced usage
export { FilteringEngine } from './enhancedDataFilter';
export { ValidationService } from './enhancedDataFilter';
export { MetricsCalculator } from './enhancedDataFilter';

// Export types
export type { 
  FilteringOptions, 
  FilteringResult, 
  ValidationResult,
  PerformanceStats,
  FilteringMetrics 
} from './enhancedDataFilter';
