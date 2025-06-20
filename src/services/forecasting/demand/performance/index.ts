
/**
 * Phase 4: Performance and Filtering Module Exports
 * 
 * Centralized exports for the enhanced performance monitoring and filtering system
 */

export { AdvancedFilteringEngine } from './filteringEngine';
export { FilteringValidator } from './filteringValidator';
export { PerformanceMonitor } from './performanceMonitor';
export { DataFilter } from './dataFilter';

export { PERFORMANCE_OPERATIONS, PERFORMANCE_THRESHOLDS, FILTER_MODE_TYPES } from './constants';

export type { 
  FilteringResult, 
  FilteringMetrics, 
  FilteringPerformanceStats 
} from './filteringEngine';

export type { 
  ValidationResult, 
  ValidationError, 
  ValidationWarning, 
  DataIntegrityCheck 
} from './filteringValidator';

export type { 
  FilteringOptions, 
  PerformanceMetrics 
} from './types';
