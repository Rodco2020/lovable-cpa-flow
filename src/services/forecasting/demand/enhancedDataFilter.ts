
/**
 * Enhanced Data Filter Service - Backward Compatible Export
 * 
 * This file maintains backward compatibility by re-exporting the refactored
 * EnhancedDataFilter class. All existing code will continue to work without changes.
 */

// Main export - re-export from the refactored module
export { EnhancedDataFilterRefactored as EnhancedDataFilter } from './enhancedDataFilter/enhancedDataFilterRefactored';

// Export individual modules for advanced usage (avoid circular imports)
export { FilteringEngine } from './enhancedDataFilter/filteringEngine';
export { SynchronousFilterProcessor } from './enhancedDataFilter/synchronousFilterProcessor';
export { ValidationService } from './enhancedDataFilter/validationService';
export { MetricsCalculator } from './enhancedDataFilter/metricsCalculator';

// Export types
export type { 
  FilteringOptions, 
  FilteringResult, 
  ValidationResult,
  PerformanceStats,
  FilteringMetrics 
} from './enhancedDataFilter/types';

// Default export for backward compatibility
export { EnhancedDataFilterRefactored as default } from './enhancedDataFilter/enhancedDataFilterRefactored';
