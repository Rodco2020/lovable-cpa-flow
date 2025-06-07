
import { ForecastData, ForecastResult } from '@/types/forecasting';
import { SkillType } from '@/types/task';
import { debugLog } from '../logger';

/**
 * Matrix Data Processor
 * Handles data merging and summary calculations for forecast results
 */
export class MatrixDataProcessor {
  /**
   * Merges demand and capacity forecast data into unified periods
   */
  static mergeForecastData(
    demandForecast: ForecastData[],
    capacityForecast: ForecastData[]
  ): ForecastData[] {
    debugLog('Processing: Merging demand and capacity forecast data', {
      demandPeriods: demandForecast.length,
      capacityPeriods: capacityForecast.length
    });

    return demandForecast.map((demandPeriod, index) => {
      const capacityPeriod = capacityForecast[index];
      
      return {
        ...demandPeriod,
        capacity: capacityPeriod?.capacity || [],
        capacityHours: capacityPeriod?.capacityHours || 0
      };
    });
  }

  /**
   * Calculates summary totals from merged forecast data
   */
  static calculateSummaryTotals(mergedData: ForecastData[]): {
    totalDemand: number;
    totalCapacity: number;
    gap: number;
  } {
    const totalDemand = mergedData.reduce((sum, period) => sum + (period.demandHours || 0), 0);
    const totalCapacity = mergedData.reduce((sum, period) => sum + (period.capacityHours || 0), 0);
    const gap = totalDemand - totalCapacity;

    debugLog('Processing: Summary totals calculated', {
      totalDemand,
      totalCapacity,
      gap
    });

    return { totalDemand, totalCapacity, gap };
  }

  /**
   * Creates the final forecast result structure
   */
  static createForecastResult(
    mergedData: ForecastData[],
    startDate: Date,
    endDate: Date,
    forecastType: 'virtual' | 'actual'
  ): ForecastResult {
    const summaryTotals = this.calculateSummaryTotals(mergedData);

    return {
      parameters: {
        mode: forecastType,
        timeframe: 'custom',
        dateRange: {
          startDate,
          endDate
        },
        granularity: 'monthly',
        includeSkills: 'all'
      },
      data: mergedData,
      financials: [],
      summary: {
        ...summaryTotals,
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0
      },
      generatedAt: new Date()
    };
  }
}
