
/**
 * Data Fetcher Service - Main Entry Point
 * 
 * This refactored module now includes enhanced data fetching capabilities
 * that connect to real Supabase data instead of mock data.
 */

export { DataFetcher } from './dataFetcher';
export { TaskQueryBuilder } from './taskQueryBuilder';
export { FilterProcessor } from './filterProcessor';
export { ForecastDataService } from './forecastDataService';
export { EnhancedDataService } from './enhancedDataService';
export * from './types';
export { useDemandData } from './useDemandData';

// Re-export enhanced service as the primary data service
export { EnhancedDataService as PrimaryDataService } from './enhancedDataService';
