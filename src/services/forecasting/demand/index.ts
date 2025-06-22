
/**
 * Demand Forecasting Module
 * 
 * This module provides comprehensive demand forecasting capabilities for the CPA Practice
 * Management Software. It generates forward-looking insights by projecting workload demand
 * based on client-assigned recurring tasks and their recurrence patterns.
 * 
 * Key Features:
 * - Virtual demand calculation from recurring task templates
 * - Task generation and scheduling simulation
 * - Matrix-based demand visualization
 * - Skill-based demand breakdown
 * - Financial demand projections (NEW: Revenue calculations)
 * - Data validation and error handling
 * - Performance optimization for large datasets
 * 
 * Architecture:
 * - Core orchestration layer (ForecastGenerator)
 * - Data fetching layer (DataFetcher)
 * - Calculation engines (DemandCalculationService, RevenueCalculationService)
 * - Matrix transformation services
 * - Validation and optimization utilities
 */

// Core demand forecasting services
export { ForecastGenerator } from './forecastGenerator';
export { DataFetcher } from './dataFetcher';

// Matrix transformation services - New modular structure
export { MatrixTransformer } from './matrixTransformer';

// NEW: Revenue calculation services
export {
  SuggestedRevenueCalculator,
  suggestedRevenueCalculator,
  RevenueComparisonService,
  revenueComparisonService,
  type SuggestedRevenueCalculation,
  type ClientRevenueData,
  type SkillDemandData,
  type RevenueComparisonResult,
  type BulkRevenueCalculationOptions
} from './calculators';

// Data validation and processing
export { DataValidator } from './dataValidator';
// Fix: Export correct name for performance optimizer
export { PerformanceOptimizer as DemandPerformanceOptimizer } from './performanceOptimizer';
export { DemandDrillDownService } from './demandDrillDownService';

// Client and skill resolution services
export { ClientResolutionService } from './clientResolutionService';
export { SkillResolutionService } from './skillResolutionService';

// Calculation and recurrence services
export { RecurrenceCalculator } from './recurrenceCalculator';
export { SkillCalculator } from './skillCalculator';
export { PeriodGenerator } from './periodGenerator';

// Re-export calculation service from matrix transformer
export { DemandCalculationService } from './matrixTransformer/demandCalculationService';

// Export types for external consumption
export type { 
  DemandForecastParameters,
  DemandFilters,
  RecurrenceCalculation
} from '@/types/demand';

export type {
  ForecastData,
  ForecastParameters,
  SkillType
} from '@/types/forecasting';
