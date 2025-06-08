
/**
 * Demand Forecasting Module
 * 
 * This module provides services for calculating and forecasting demand based on
 * client-assigned recurring tasks. It breaks down the complex demand calculation
 * process into focused, maintainable services.
 * 
 * Core Services:
 * - DataFetcher: Handles data retrieval from the database
 * - RecurrenceCalculator: Calculates task recurrence patterns and frequencies
 * - SkillCalculator: Distributes demand across required skills
 * - PeriodGenerator: Creates time periods for forecasting
 * - MatrixTransformer: Transforms data into matrix format for display
 * - ForecastGenerator: Orchestrates the entire forecast generation process
 */

export { DataFetcher } from './dataFetcher';
export { RecurrenceCalculator } from './recurrenceCalculator';
export { SkillCalculator } from './skillCalculator';
export { PeriodGenerator } from './periodGenerator';
export { MatrixTransformer } from './matrixTransformer';
export { ForecastGenerator } from './forecastGenerator';
