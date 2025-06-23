
/**
 * Matrix Transformer Module Exports
 * 
 * Enhanced with client totals calculation functionality
 */

export { MatrixTransformerCore } from './matrixTransformerCore';
export { SkillMappingService } from './skillMappingService';
export { DataPointGenerationService } from './dataPointGenerationService';
export { PeriodProcessingService } from './periodProcessingService';
export { CalculationUtils } from './calculationUtils';
export { DemandCalculationService } from './demandCalculationService';
export { ClientTotalsCalculator } from './clientTotalsCalculator';

// Export types
export type {
  SkillMappingResult,
  DataPointGenerationContext,
  MatrixTotals,
  SkillSummary
} from './types';

