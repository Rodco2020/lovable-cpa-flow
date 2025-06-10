
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
 * - Financial demand projections
 * - Data validation and error handling
 * - Performance optimization for large datasets
 * 
 * Architecture:
 * - Core orchestration layer (DemandForecastGenerator)
 * - Data fetching layer (DataFetcher)
 * - Calculation engines (DemandCalculationEngine, etc.)
 * - Matrix transformation services
 * - Validation and optimization utilities
 */

// Core demand forecasting services
export { DemandForecastGenerator as ForecastGenerator } from './demandForecastGenerator';
export { DataFetcher } from './dataFetcher';
export { DemandCalculationEngine } from './demandCalculationEngine';

// Matrix transformation services - New modular structure
export { MatrixTransformer } from './matrixTransformer';

// Data validation and processing
export { DataValidator } from './dataValidator';
export { DemandPerformanceOptimizer } from './performanceOptimizer';
export { DemandDrillDownService } from './demandDrillDownService';

// Client and skill resolution services
export { ClientResolutionService } from './clientResolutionService';
export { SkillResolutionService } from './skillResolutionService';

// Utility services
export { TaskGenerationSimulator } from './taskGenerationSimulator';

// Export types for external consumption
export type { 
  DemandForecastParameters,
  DemandCalculationResult,
  DemandValidationResult,
  TaskSimulationResult 
} from './types';
