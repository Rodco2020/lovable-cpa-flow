
/**
 * Forecasting Demand Calculators Module
 * 
 * This module provides comprehensive revenue calculation services for the
 * Demand Forecast Matrix, supporting both "Total Suggested Revenue" and
 * "Expected Less Suggested" column calculations.
 * 
 * Key Components:
 * - SuggestedRevenueCalculator: Core calculation engine for skill-based revenue
 * - RevenueComparisonService: Bulk processing and comparison service
 * - Performance optimization and caching mechanisms
 * - Comprehensive error handling and fallback logic
 */

// Core calculator exports
export {
  SuggestedRevenueCalculator,
  suggestedRevenueCalculator,
  SuggestedRevenueCalculatorError,
  type SuggestedRevenueCalculation
} from './SuggestedRevenueCalculator';

// Comparison service exports
export {
  RevenueComparisonService,
  revenueComparisonService,
  RevenueComparisonServiceError,
  type SkillDemandData,
  type RevenueComparisonResult,
  type BulkRevenueCalculationOptions
} from './RevenueComparisonService';

// Re-export ClientRevenueData from demand types for convenience
export type { ClientRevenueData } from '@/types/demand';

// Re-export utility types from skills service for convenience
export type {
  SkillFeeRate,
  SkillFeeRateMap
} from '@/services/skills/feeRateService';
