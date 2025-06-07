
import { ForecastResult } from '@/types/forecasting';
import { SkillType } from '@/types/task';
import { MatrixForecastResult } from './types';
import { debugLog } from '../logger';

/**
 * Empty State Handler
 * Manages creation of empty forecast data when no skills or data are available
 */
export class EmptyStateHandler {
  /**
   * Creates empty forecast data when no database skills exist
   */
  static async createEmptyForecastData(
    startDate: Date, 
    endDate: Date, 
    forecastType: 'virtual' | 'actual'
  ): Promise<MatrixForecastResult> {
    debugLog('EmptyState: Creating empty forecast data - no database skills available');
    
    const forecastResult: ForecastResult = {
      parameters: {
        mode: forecastType,
        timeframe: 'custom',
        dateRange: { startDate, endDate },
        granularity: 'monthly',
        includeSkills: 'all'
      },
      data: [],
      financials: [],
      summary: {
        totalDemand: 0,
        totalCapacity: 0,
        gap: 0,
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0
      },
      generatedAt: new Date()
    };
    
    debugLog('EmptyState: Empty forecast data created - user needs to add skills to database');
    
    return { 
      forecastResult, 
      availableSkills: [] 
    };
  }
}
