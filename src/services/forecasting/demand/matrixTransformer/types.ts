import { DemandMatrixData, DemandDataPoint, ClientTaskDemand, ClientRevenueData } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB, SkillType } from '@/types/task';

export interface SkillMappingResult {
  skills: SkillType[];
  skillMapping: Map<string, string>;
}

export interface DataPointGenerationContext {
  forecastData: ForecastData[];
  tasks: RecurringTaskDB[];
  skills: SkillType[];
  skillMapping: Map<string, string>;
  /** NEW: Revenue calculation context */
  revenueContext?: {
    includeRevenueCalculations: boolean;
    skillFeeRates: Map<string, number>;
    clientRevenueData: Map<string, ClientRevenueData>;
    useClientExpectedRevenue: boolean;
  };
}

export interface MatrixTotals {
  totalDemand: number;
  totalTasks: number;
  totalClients: number;
  /** NEW: Revenue totals */
  totalSuggestedRevenue?: number;
  totalExpectedRevenue?: number;
  totalExpectedLessSuggested?: number;
}

export interface SkillSummary {
  [key: string]: {
    totalHours: number;
    taskCount: number;
    clientCount: number;
    /** NEW: Skill-level revenue summaries */
    totalSuggestedRevenue?: number;
    totalExpectedLessSuggested?: number;
    averageFeeRate?: number;
  };
}

/**
 * NEW: Interface for revenue calculation results during matrix transformation
 */
export interface MatrixRevenueCalculationResult {
  dataPointRevenues: Map<string, { suggestedRevenue: number; expectedLessSuggested: number }>;
  clientRevenues: Map<string, { suggestedRevenue: number; expectedLessSuggested: number }>;
  skillRevenues: Map<string, { suggestedRevenue: number; expectedLessSuggested: number }>;
  totals: {
    totalSuggestedRevenue: number;
    totalExpectedRevenue: number;
    totalExpectedLessSuggested: number;
  };
  calculationMetrics: {
    processedDataPoints: number;
    calculationTime: number;
    fallbackRatesUsed: number;
    errors: string[];
  };
}

/**
 * NEW: Configuration for matrix revenue calculations
 */
export interface MatrixRevenueCalculationConfig {
  enabled: boolean;
  useSkillFeeRates: boolean;
  useClientExpectedRevenue: boolean;
  fallbackToDefaultRates: boolean;
  includeProfitabilityAnalysis: boolean;
  cacheResults: boolean;
  batchSize: number;
}

/**
 * NEW: Context for revenue-enhanced data point generation
 */
export interface RevenueEnhancedDataPointContext extends DataPointGenerationContext {
  revenueCalculationConfig: MatrixRevenueCalculationConfig;
  revenueCalculationResults?: MatrixRevenueCalculationResult;
}

/**
 * Enhanced matrix data point with revenue calculations
 */
export interface RevenueEnhancedDataPoint extends DemandDataPoint {
  suggestedRevenue: number;
  expectedLessSuggested: number;
  revenueCalculationMetadata: {
    feeRateUsed: number;
    isFallbackRate: boolean;
    calculationTimestamp: Date;
    clientExpectedRevenue?: number;
  };
}

/**
 * NEW: Revenue validation result for matrix data
 */
export interface MatrixRevenueValidationResult {
  isValid: boolean;
  issues: Array<{
    type: 'missing_fee_rate' | 'invalid_calculation' | 'negative_revenue' | 'data_inconsistency';
    skillType?: string;
    clientId?: string;
    month?: string;
    message: string;
    severity: 'warning' | 'error';
  }>;
  summary: {
    totalDataPoints: number;
    validDataPoints: number;
    dataPointsWithRevenue: number;
    fallbackRatesUsed: number;
  };
}

/**
 * NEW: Performance metrics for revenue calculations
 */
export interface RevenueCalculationPerformanceMetrics {
  startTime: number;
  endTime: number;
  totalDuration: number;
  dataPointsProcessed: number;
  calculationsPerSecond: number;
  memoryUsage: {
    beforeCalculation: number;
    afterCalculation: number;
    peakUsage: number;
  };
  cacheStats: {
    hits: number;
    misses: number;
    hitRate: number;
  };
  errorStats: {
    totalErrors: number;
    errorsByType: Record<string, number>;
  };
}

/**
 * NEW: Integration verification result for Phase 4 testing
 */
export interface IntegrationVerificationResult {
  matrixTransformation: {
    successful: boolean;
    processingTime: number;
    dataPointsGenerated: number;
    revenueCalculationsComplete: boolean;
    performanceWithinThreshold: boolean;
  };
  revenueCalculations: {
    skillFeeRatesLoaded: boolean;
    suggestedRevenueCalculated: boolean;
    expectedLessSuggestedCalculated: boolean;
    clientRevenueMetricsComplete: boolean;
    matrixTotalsCalculated: boolean;
  };
  dataValidation: {
    structureValid: boolean;
    revenueFieldsPresent: boolean;
    dataConsistencyChecks: boolean;
    backwardCompatibilityMaintained: boolean;
  };
  performance: {
    transformationTime: number;
    memoryUsage: number;
    withinTimeThreshold: boolean;
    withinMemoryThreshold: boolean;
  };
  errors: string[];
  warnings: string[];
}
