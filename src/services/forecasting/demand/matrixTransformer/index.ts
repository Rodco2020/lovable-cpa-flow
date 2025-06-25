
/**
 * Matrix Transformer Module Exports
 * 
 * Enhanced with revenue calculation and data enrichment services
 */

export { MatrixTransformerCore } from './matrixTransformerCore';
export { SkillMappingService } from './skillMappingService';
export { DataPointGenerationService } from './dataPointGenerationService';
export { PeriodProcessingService } from './periodProcessingService';
export { CalculationUtils } from './calculationUtils';
export { DemandCalculationService } from './demandCalculationService';
export { ClientTotalsCalculator } from './clientTotalsCalculator';

// New focused services
export { MatrixRevenueCalculator } from './matrixRevenueCalculator';
export { MatrixDataEnricher } from './matrixDataEnricher';

// Export types
export type {
  SkillMappingResult,
  DataPointGenerationContext,
  MatrixTotals,
  SkillSummary
} from './types';
