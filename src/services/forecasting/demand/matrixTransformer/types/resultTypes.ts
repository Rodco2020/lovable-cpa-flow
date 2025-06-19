
import { PreferredStaffProcessingResult } from './preferredStaffTypes';
import { SkillSummary } from './coreTypes';

/**
 * Results and metadata for matrix transformation
 */
export interface TransformationResult {
  dataPoints: any[];
  clientTotals: Map<string, number>;
  skillSummary: SkillSummary;
  clientRevenue?: Map<string, number>;
  skillFeeRates?: Map<string, number>;
  /**
   * NEW: Preferred staff results and statistics
   */
  preferredStaffResults?: PreferredStaffProcessingResult;
  /**
   * NEW: Matrix-level preferred staff totals
   */
  preferredStaffTotals?: {
    totalTasksWithPreferredStaff: number;
    totalTasksWithoutPreferredStaff: number;
    uniquePreferredStaffCount: number;
    preferredStaffUtilization: number;
  };
  metadata: {
    processingTime: number;
    dataQuality: {
      validTasks: number;
      invalidTasks: number;
      warningCount: number;
    };
    /**
     * NEW: Preferred staff processing metadata
     */
    preferredStaffProcessing?: {
      enabled: boolean;
      resolvedStaff: number;
      unresolvedStaff: number;
      processingTime: number;
      cacheHits: number;
    };
  };
}

export interface MatrixRevenueCalculationResult {
  clientSuggestedRevenue: Map<string, number>;
  clientExpectedLessSuggested: Map<string, number>;
  totalSuggestedRevenue: number;
  totalExpectedRevenue: number;
  totalExpectedLessSuggested: number;
  calculationMetadata: {
    processingTime: number;
    clientsProcessed: number;
    errorsEncountered: number;
    fallbackRatesUsed: number;
  };
}
