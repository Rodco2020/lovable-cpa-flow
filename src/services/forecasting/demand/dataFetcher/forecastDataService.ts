
/**
 * Forecast Data Service
 * Handles forecast data generation and processing
 */

import { ForecastPeriod } from './types';
import { format, addMonths, startOfMonth } from 'date-fns';

export class ForecastDataService {
  /**
   * Generate forecast periods for a given start date
   */
  static generateForecastPeriods(startDate: Date, monthsCount: number = 12): ForecastPeriod[] {
    console.log('📅 [FORECAST DATA SERVICE] Generating forecast periods:', {
      startDate: startDate.toISOString().split('T')[0],
      monthsCount
    });

    const periods: ForecastPeriod[] = [];

    for (let i = 0; i < monthsCount; i++) {
      const periodDate = addMonths(startOfMonth(startDate), i);
      const period = format(periodDate, 'yyyy-MM');
      const periodLabel = format(periodDate, 'MMM yyyy');

      periods.push({
        period,
        periodLabel,
        demand: [], // Will be populated by demand calculation
        capacity: [], // Will be populated by capacity calculation
        demandHours: 0,
        capacityHours: 0
      });
    }

    console.log(`✅ [FORECAST DATA SERVICE] Generated ${periods.length} forecast periods`);
    return periods;
  }

  /**
   * Fetch forecast data with error handling
   */
  static async fetchForecastData(startDate: Date): Promise<ForecastPeriod[]> {
    try {
      console.log('🔄 [FORECAST DATA SERVICE] Fetching forecast data for:', startDate.toISOString().split('T')[0]);
      
      // Generate basic forecast structure
      const forecastPeriods = this.generateForecastPeriods(startDate);
      
      console.log(`✅ [FORECAST DATA SERVICE] Successfully generated ${forecastPeriods.length} forecast periods`);
      return forecastPeriods;
      
    } catch (error) {
      console.error('❌ [FORECAST DATA SERVICE] Error fetching forecast data:', error);
      
      // Return minimal structure to prevent crashes
      return this.generateForecastPeriods(startDate);
    }
  }
}
