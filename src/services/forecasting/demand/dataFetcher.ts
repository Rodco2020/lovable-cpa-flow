
/**
 * Data Fetcher Service - Backward Compatible Export
 * 
 * This file maintains backward compatibility by re-exporting the refactored
 * DataFetcher class. All existing code will continue to work without changes.
 * 
 * The refactoring addresses the "0 client-assigned tasks" issue through:
 * ✅ Improved query construction
 * ✅ Enhanced error handling and logging
 * ✅ Better filter processing
 * ✅ Comprehensive debugging information
 * ✅ Modular architecture for maintainability
 */

export { DataFetcher } from './dataFetcher/dataFetcher';

// Export additional utilities for advanced usage
export { TaskQueryBuilder } from './dataFetcher/taskQueryBuilder';
export { FilterProcessor } from './dataFetcher/filterProcessor';
export { ForecastDataService } from './dataFetcher/forecastDataService';
export type { TaskFetchResult, FilterValidationResult } from './dataFetcher/types';
