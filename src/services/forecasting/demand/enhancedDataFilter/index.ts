
/**
 * Enhanced Data Filter - Refactored Module Index
 * 
 * This refactored module maintains 100% backward compatibility while providing
 * improved code organization through focused, single-responsibility components.
 * 
 * PRESERVED FUNCTIONALITY:
 * - Exact same public API
 * - Identical filtering behavior
 * - Same performance characteristics
 * - All logging and error handling preserved
 * 
 * ARCHITECTURAL IMPROVEMENTS:
 * - Modular design with focused responsibilities
 * - Better testability through isolated components
 * - Enhanced maintainability and code organization
 * - Clear separation of concerns
 */

// Main refactored service (maintains backward compatibility)
export { EnhancedDataFilterRefactored as EnhancedDataFilter } from './enhancedDataFilterRefactored';

// Export individual modules for advanced usage
export { FilteringEngine } from './filteringEngine';
export { SynchronousFilterProcessor } from './synchronousFilterProcessor';
export { ValidationService } from './validationService';
export { MetricsCalculator } from './metricsCalculator';

// Export types for external use
export type {
  FilteringOptions,
  FilteringResult,
  ValidationResult,
  PerformanceStats,
  FilteringMetrics,
  PreferredStaffFilter,
  TimeHorizonFilter
} from './types';

// Default export for backward compatibility
export { EnhancedDataFilterRefactored as default } from './enhancedDataFilterRefactored';
