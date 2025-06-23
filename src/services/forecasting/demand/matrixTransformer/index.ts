
/**
 * Matrix Transformer Module Exports
 * 
 * Enhanced with refactored core module and client totals calculation functionality
 */

export { MatrixTransformerCore } from './core/matrixTransformerCore';
export { SkillMappingService } from './skillMappingService';
export { DataPointGenerationService } from './dataPointGenerationService';
export { PeriodProcessingService } from './periodProcessingService';
export { CalculationUtils } from './calculationUtils';
export { DemandCalculationService } from './demandCalculationService';
export { ClientTotalsCalculator } from './clientTotalsCalculator';

// Export refactored core components
export * from './core';

// Export types
export type {
  SkillMappingResult,
  DataPointGenerationContext,
  MatrixTotals,
  SkillSummary
} from './types';
