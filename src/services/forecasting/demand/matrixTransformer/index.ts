
/**
 * Matrix Transformer Module
 * 
 * This module provides a refactored, modular approach to matrix data transformation
 * while maintaining 100% backward compatibility with the existing API.
 * 
 * The refactoring improves:
 * - Code organization through separation of concerns
 * - Maintainability through smaller, focused modules
 * - Testability through isolated components
 * - Documentation through clear interfaces and types
 * 
 * Architecture:
 * - MatrixTransformerCore: Main orchestrator
 * - SkillMappingService: Handles skill resolution and mapping
 * - DemandCalculationService: Calculates demand metrics
 * - DataPointGenerationService: Generates matrix data points
 * - PeriodProcessingService: Processes forecast periods
 * - CalculationUtils: Utility functions for calculations
 */

export { MatrixTransformerCore } from './matrixTransformerCore';
export { SkillMappingService } from './skillMappingService';
export { DemandCalculationService } from './demandCalculationService';
export { DataPointGenerationService } from './dataPointGenerationService';
export { PeriodProcessingService } from './periodProcessingService';
export { CalculationUtils } from './calculationUtils';

export type {
  SkillMappingResult,
  DataPointGenerationContext,
  MatrixTotals,
  SkillSummary
} from './types';
