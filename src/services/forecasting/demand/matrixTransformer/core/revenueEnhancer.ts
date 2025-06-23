
import { DemandDataPoint } from '@/types/demand';
import { ClientRevenueCalculator } from '../clientRevenueCalculator';
import { SkillFeeRateManager } from '../skillFeeRateManager';
import { PerformanceOptimizer } from '../performanceOptimizer';
import { MATRIX_TRANSFORMER_CONFIG } from './constants';

/**
 * Revenue Enhancement Module
 * Handles revenue-related calculations and enhancements
 */
export class RevenueEnhancer {
  /**
   * Enhance data points with revenue calculations
   */
  static async enhanceDataPointsWithRevenue(
    dataPoints: DemandDataPoint[]
  ): Promise<DemandDataPoint[]> {
    const { revenueCalculator, skillFeeRates } = await this.initializeRevenueComponents();
    
    return PerformanceOptimizer.processWithConcurrencyLimit(
      dataPoints,
      async (dataPoint) => {
        const suggestedRevenue = this.calculateSuggestedRevenue(dataPoint, skillFeeRates);
        const expectedRevenue = await revenueCalculator.getExpectedRevenue(dataPoint);
        const expectedLessSuggested = expectedRevenue - suggestedRevenue;
        
        const enhancedTaskBreakdown = dataPoint.taskBreakdown?.map(task => ({
          ...task,
          suggestedRevenue: (task.monthlyHours * (skillFeeRates.get(task.skillType) || MATRIX_TRANSFORMER_CONFIG.FALLBACK_FEE_RATE))
        }));
        
        return {
          ...dataPoint,
          suggestedRevenue,
          expectedLessSuggested,
          taskBreakdown: enhancedTaskBreakdown
        };
      },
      MATRIX_TRANSFORMER_CONFIG.CONCURRENCY_LIMIT
    );
  }

  /**
   * Initialize revenue calculation components
   */
  private static async initializeRevenueComponents() {
    const revenueCalculator = new ClientRevenueCalculator();
    const skillFeeRateManager = new SkillFeeRateManager();
    const skillFeeRates = await skillFeeRateManager.getSkillFeeRates();
    
    return { revenueCalculator, skillFeeRates };
  }

  /**
   * Calculate suggested revenue for a data point
   */
  private static calculateSuggestedRevenue(
    dataPoint: DemandDataPoint, 
    skillFeeRates: Map<string, number>
  ): number {
    const feeRate = skillFeeRates.get(dataPoint.skillType) || MATRIX_TRANSFORMER_CONFIG.FALLBACK_FEE_RATE;
    return dataPoint.demandHours * feeRate;
  }
}
