/**
 * Revenue Comparison Service
 * 
 * Handles bulk revenue calculations and comparisons for the Demand Forecast Matrix.
 * This service orchestrates the calculation of both "Total Suggested Revenue" and
 * "Expected Less Suggested" columns with optimized performance for large datasets.
 * 
 * Key Features:
 * - Bulk processing with performance optimization
 * - Memory-efficient data processing
 * - Comprehensive error handling and recovery
 * - Performance monitoring and benchmarking
 * - Caching for repeated calculations
 */

import { suggestedRevenueCalculator, type SuggestedRevenueCalculation } from './SuggestedRevenueCalculator';
import { getSkillFeeRatesMap } from '@/services/skills/feeRateService';
import type { ClientRevenueData } from '@/types/demand';

export class RevenueComparisonServiceError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'RevenueComparisonServiceError';
  }
}

export interface SkillDemandData {
  skillName: string;
  demandHours: number;
  clientCount: number;
  taskCount: number;
}

export interface RevenueComparisonResult {
  totalSuggestedRevenue: number;
  totalExpectedRevenue: number;
  expectedLessSuggested: number;
  skillBreakdown: SuggestedRevenueCalculation[];
  clientRevenueBreakdown: Array<{
    clientId: string;
    clientName: string;
    expectedRevenue: number;
    suggestedRevenue: number;
    difference: number;
  }>;
  performanceMetrics: {
    calculationTimeMs: number;
    skillsProcessed: number;
    clientsProcessed: number;
    cacheHits: number;
    errors: number;
  };
}

export interface BulkRevenueCalculationOptions {
  useCache?: boolean;
  batchSize?: number;
  includeDetailedBreakdown?: boolean;
  performanceMonitoring?: boolean;
}

export class RevenueComparisonService {
  private static instance: RevenueComparisonService;
  private cache = new Map<string, number>();
  private performanceMetrics = {
    totalCalculations: 0,
    totalErrors: 0,
    averageCalculationTime: 0,
    cacheHitRate: 0
  };

  private constructor() {}

  public static getInstance(): RevenueComparisonService {
    if (!RevenueComparisonService.instance) {
      RevenueComparisonService.instance = new RevenueComparisonService();
    }
    return RevenueComparisonService.instance;
  }

  /**
   * Calculate comprehensive revenue comparison for matrix data
   * @param skillDemandData - Array of skill demand data
   * @param clientRevenueData - Array of client revenue data
   * @param options - Calculation options
   * @returns Complete revenue comparison result
   */
  public async calculateRevenueComparison(
    skillDemandData: SkillDemandData[],
    clientRevenueData: ClientRevenueData[],
    options: BulkRevenueCalculationOptions = {}
  ): Promise<RevenueComparisonResult> {
    const startTime = performance.now();
    const opts = {
      useCache: true,
      batchSize: 100,
      includeDetailedBreakdown: true,
      performanceMonitoring: true,
      ...options
    };

    try {
      console.log(`Starting revenue comparison calculation for ${skillDemandData.length} skills and ${clientRevenueData.length} clients`);

      // Get skill fee rates
      const skillFeeRates = await getSkillFeeRatesMap();
      
      // Calculate suggested revenue for all skills
      const skillBreakdown = await this.calculateSuggestedRevenueForSkills(
        skillDemandData,
        skillFeeRates,
        opts
      );

      // Calculate total suggested revenue
      const totalSuggestedRevenue = suggestedRevenueCalculator.getTotalSuggestedRevenue(skillBreakdown);

      // Calculate total expected revenue - use expectedMonthlyRevenue property
      const totalExpectedRevenue = clientRevenueData.reduce(
        (sum, client) => sum + client.expectedMonthlyRevenue,
        0
      );

      // Calculate expected less suggested
      const expectedLessSuggested = suggestedRevenueCalculator.calculateExpectedLessSuggested(
        totalExpectedRevenue,
        totalSuggestedRevenue
      );

      // Calculate client-level breakdown if requested
      const clientRevenueBreakdown = opts.includeDetailedBreakdown
        ? await this.calculateClientRevenueBreakdown(clientRevenueData, skillBreakdown)
        : [];

      const endTime = performance.now();
      const calculationTimeMs = endTime - startTime;

      // Update performance metrics
      this.updatePerformanceMetrics(calculationTimeMs, skillDemandData.length + clientRevenueData.length);

      const result: RevenueComparisonResult = {
        totalSuggestedRevenue,
        totalExpectedRevenue,
        expectedLessSuggested,
        skillBreakdown,
        clientRevenueBreakdown,
        performanceMetrics: {
          calculationTimeMs,
          skillsProcessed: skillDemandData.length,
          clientsProcessed: clientRevenueData.length,
          cacheHits: this.getCacheHitCount(),
          errors: skillBreakdown.filter(s => s.calculationNotes?.includes('Error')).length
        }
      };

      console.log(`Revenue comparison completed in ${calculationTimeMs.toFixed(2)}ms:`, {
        totalSuggestedRevenue,
        totalExpectedRevenue,
        expectedLessSuggested
      });

      return result;
    } catch (error) {
      const errorMessage = `Failed to calculate revenue comparison: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMessage, error);
      this.performanceMetrics.totalErrors++;
      
      throw new RevenueComparisonServiceError(errorMessage, 'COMPARISON_CALCULATION_ERROR');
    }
  }

  /**
   * Calculate suggested revenue for multiple skills with batching
   * @param skillDemandData - Array of skill demand data
   * @param skillFeeRates - Map of skill fee rates
   * @param options - Calculation options
   * @returns Array of skill revenue calculations
   */
  private async calculateSuggestedRevenueForSkills(
    skillDemandData: SkillDemandData[],
    skillFeeRates: Map<string, number>,
    options: BulkRevenueCalculationOptions
  ): Promise<SuggestedRevenueCalculation[]> {
    const results: SuggestedRevenueCalculation[] = [];
    const batchSize = options.batchSize || 100;

    // Process in batches for better performance
    for (let i = 0; i < skillDemandData.length; i += batchSize) {
      const batch = skillDemandData.slice(i, i + batchSize);
      const batchData = batch.map(skill => ({
        skillName: skill.skillName,
        demandHours: skill.demandHours
      }));

      const batchResults = suggestedRevenueCalculator.bulkCalculateSuggestedRevenue(
        batchData,
        skillFeeRates
      );

      results.push(...batchResults);

      // Cache results if enabled
      if (options.useCache) {
        batchResults.forEach(result => {
          const cacheKey = `${result.skillName}:${result.demandHours}`;
          this.cache.set(cacheKey, result.suggestedRevenue);
        });
      }

      // Yield control for large datasets
      if (batch.length === batchSize) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    return results;
  }

  /**
   * Calculate client-level revenue breakdown
   * @param clientRevenueData - Array of client revenue data
   * @param skillBreakdown - Array of skill calculations
   * @returns Array of client revenue breakdowns
   */
  private async calculateClientRevenueBreakdown(
    clientRevenueData: ClientRevenueData[],
    skillBreakdown: SuggestedRevenueCalculation[]
  ): Promise<Array<{
    clientId: string;
    clientName: string;
    expectedRevenue: number;
    suggestedRevenue: number;
    difference: number;
  }>> {
    // For now, we'll distribute suggested revenue proportionally based on expected revenue
    // This is a simplified approach - in practice, you might want more sophisticated allocation
    const totalExpectedRevenue = clientRevenueData.reduce((sum, client) => sum + client.expectedMonthlyRevenue, 0);
    const totalSuggestedRevenue = suggestedRevenueCalculator.getTotalSuggestedRevenue(skillBreakdown);

    return clientRevenueData.map(client => {
      const proportion = totalExpectedRevenue > 0 ? client.expectedMonthlyRevenue / totalExpectedRevenue : 0;
      const suggestedRevenue = Number((totalSuggestedRevenue * proportion).toFixed(2));
      const difference = suggestedRevenueCalculator.calculateExpectedLessSuggested(
        client.expectedMonthlyRevenue,
        suggestedRevenue
      );

      return {
        clientId: client.clientId,
        clientName: client.clientName,
        expectedRevenue: client.expectedMonthlyRevenue,
        suggestedRevenue,
        difference
      };
    });
  }

  /**
   * Get cached calculation result
   * @param skillName - Name of the skill
   * @param demandHours - Number of demand hours
   * @returns Cached result or undefined
   */
  public getCachedResult(skillName: string, demandHours: number): number | undefined {
    const cacheKey = `${skillName}:${demandHours}`;
    return this.cache.get(cacheKey);
  }

  /**
   * Clear calculation cache
   */
  public clearCache(): void {
    this.cache.clear();
    console.log('Revenue calculation cache cleared');
  }

  /**
   * Get current performance metrics
   */
  public getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }

  private updatePerformanceMetrics(calculationTime: number, itemsProcessed: number): void {
    this.performanceMetrics.totalCalculations++;
    this.performanceMetrics.averageCalculationTime = 
      (this.performanceMetrics.averageCalculationTime + calculationTime) / 2;
    
    // Update cache hit rate
    const totalCacheOperations = itemsProcessed;
    const cacheHits = this.getCacheHitCount();
    this.performanceMetrics.cacheHitRate = 
      totalCacheOperations > 0 ? (cacheHits / totalCacheOperations) * 100 : 0;
  }

  private getCacheHitCount(): number {
    return this.cache.size;
  }
}

// Export singleton instance
export const revenueComparisonService = RevenueComparisonService.getInstance();
