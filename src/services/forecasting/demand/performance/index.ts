
/**
 * Performance Module Index
 */

// Data processing
export { DataFilter } from './dataFilter';
export { PerformanceOptimizer } from '../performanceOptimizer';

// Filtering engine
export { 
  FilteringEngine,
  type FilteringMetrics,
  type FilteringPerformanceStats 
} from './filteringEngine';

// Validation
export { 
  FilteringValidator,
  type DataIntegrityCheck 
} from './filteringValidator';

// Cache management
export { CacheManager } from './cacheManager';

// Monitoring
export { PerformanceMonitor } from './performanceMonitor';
