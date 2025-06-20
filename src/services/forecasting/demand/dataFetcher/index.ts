/**
 * Data Fetcher Service - Main Entry Point
 * 
 * This refactored module breaks down the complex dataFetcher into focused components:
 * - TaskQueryBuilder: Handles query construction logic
 * - FilterProcessor: Processes and validates filters
 * - DataValidator: Validates and cleans fetched data
 * - ForecastDataService: Handles forecast data operations
 * - DataFetcher: Main orchestrator (backward compatible API)
 */

export { DataFetcher } from './dataFetcher';
export { TaskQueryBuilder } from './taskQueryBuilder';
export { FilterProcessor } from './filterProcessor';
export { ForecastDataService } from './forecastDataService';
export * from './types';
export { useDemandData } from './useDemandData';
